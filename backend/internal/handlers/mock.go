package handlers

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type MockHandler struct{}

func NewMockHandler() *MockHandler { return &MockHandler{} }

var egovData = map[string]map[string]interface{}{
	"default": {
		"full_name":     "Иванов Иван Иванович",
		"org_name":      "ТОО «Тест Компания»",
		"org_type":      "МСБ",
		"region":        "Астана",
		"registered_at": "2020-01-15",
	},
	"000000000000": {
		"full_name":     "Администратор",
		"org_name":      nil,
		"org_type":      nil,
		"region":        "Астана",
		"registered_at": "2020-01-01",
	},
}

func (h *MockHandler) EGov(w http.ResponseWriter, r *http.Request) {
	iin := chi.URLParam(r, "iin")
	data, ok := egovData[iin]
	if !ok {
		data = egovData["default"]
	}
	result := map[string]interface{}{
		"iin": iin,
	}
	for k, v := range data {
		result[k] = v
	}
	respond(w, http.StatusOK, result)
}

func (h *MockHandler) EISHSubmit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ApplicationID string `json:"application_id"`
	}
	if err := decode(r, &req); err != nil || req.ApplicationID == "" {
		respondErr(w, http.StatusBadRequest, "application_id required")
		return
	}
	respond(w, http.StatusOK, map[string]interface{}{
		"status":      "accepted",
		"external_id": fmt.Sprintf("EISH-2026-%05d", len(req.ApplicationID)),
		"message":     "Заявка передана в BPM систему",
	})
}
