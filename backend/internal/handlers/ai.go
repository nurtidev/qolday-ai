package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type AIHandler struct {
	apiKey string
}

func NewAIHandler(apiKey string) *AIHandler {
	return &AIHandler{apiKey: apiKey}
}

const systemPrompt = `Ты — конструктор форм для казахстанских государственных услуг.
На основе описания услуги сгенерируй form_schema в JSON формате.
Верни ТОЛЬКО валидный JSON без markdown блоков, без пояснений.

Формат ответа:
{
  "steps": [
    {
      "id": "step_1",
      "title": "Название шага",
      "fields": [
        {
          "id": "field_1",
          "type": "text|textarea|number|select|multiselect|date|file|calculated|checkbox|radio",
          "label": "Название поля",
          "placeholder": "Подсказка (опционально)",
          "required": true,
          "options": ["Опция 1", "Опция 2"],
          "mask": "currency|percent",
          "formula": "field_X * field_Y",
          "readonly": false,
          "accept": ".pdf,.xlsx",
          "prefill_from": "egov.field_name"
        }
      ],
      "condition": {
        "field_id": "field_X",
        "operator": "equals|not_equals|greater_than|less_than",
        "value": "значение"
      }
    }
  ]
}

Правила:
- type "calculated" использует formula (JS выражение с id полей)
- type "file" использует accept для разрешённых форматов
- condition на step делает шаг условным
- prefill_from используй для полей БИН/ИИН и названия организации (egov.iin, egov.org_name)
- Всегда начинай с шага информации о заявителе/компании
`

type claudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system"`
	Messages  []claudeMessage `json:"messages"`
}

type claudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type claudeResponse struct {
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (h *AIHandler) GenerateForm(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Description string `json:"description"`
	}
	if err := decode(r, &req); err != nil || strings.TrimSpace(req.Description) == "" {
		respondErr(w, http.StatusBadRequest, "description required")
		return
	}

	payload := claudeRequest{
		Model:     "claude-sonnet-4-6",
		MaxTokens: 4096,
		System:    systemPrompt,
		Messages:  []claudeMessage{{Role: "user", Content: req.Description}},
	}

	body, _ := json.Marshal(payload)
	httpReq, _ := http.NewRequestWithContext(r.Context(), http.MethodPost,
		"https://api.anthropic.com/v1/messages", bytes.NewReader(body))
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-api-key", h.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		respondErr(w, http.StatusBadGateway, "claude api unreachable")
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var claudeResp claudeResponse
	if err := json.Unmarshal(respBody, &claudeResp); err != nil {
		respondErr(w, http.StatusInternalServerError, "failed to parse claude response")
		return
	}
	if claudeResp.Error != nil {
		respondErr(w, http.StatusBadGateway, fmt.Sprintf("claude error: %s", claudeResp.Error.Message))
		return
	}
	if len(claudeResp.Content) == 0 {
		respondErr(w, http.StatusInternalServerError, "empty response from claude")
		return
	}

	rawJSON := strings.TrimSpace(claudeResp.Content[0].Text)
	// Strip accidental markdown fences
	rawJSON = strings.TrimPrefix(rawJSON, "```json")
	rawJSON = strings.TrimPrefix(rawJSON, "```")
	rawJSON = strings.TrimSuffix(rawJSON, "```")
	rawJSON = strings.TrimSpace(rawJSON)

	var schema map[string]interface{}
	if err := json.Unmarshal([]byte(rawJSON), &schema); err != nil {
		respondErr(w, http.StatusInternalServerError, "claude returned invalid JSON")
		return
	}

	respond(w, http.StatusOK, map[string]interface{}{"form_schema": schema})
}
