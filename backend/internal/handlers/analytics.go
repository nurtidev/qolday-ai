package handlers

import (
	"net/http"

	"github.com/jmoiron/sqlx"
)

type AnalyticsHandler struct {
	db *sqlx.DB
}

func NewAnalyticsHandler(db *sqlx.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

func (h *AnalyticsHandler) Summary(w http.ResponseWriter, r *http.Request) {
	var totalApplications, totalServices, totalUsers int
	var pendingApplications int

	h.db.Get(&totalApplications, `SELECT COUNT(*) FROM applications`)
	h.db.Get(&totalServices, `SELECT COUNT(*) FROM services`)
	h.db.Get(&totalUsers, `SELECT COUNT(*) FROM users`)
	h.db.Get(&pendingApplications,
		`SELECT COUNT(*) FROM applications WHERE status IN ('submitted','in_review')`)

	type statusCount struct {
		Status string `db:"status" json:"status"`
		Count  int    `db:"count"  json:"count"`
	}
	var byStatus []statusCount
	h.db.Select(&byStatus,
		`SELECT status, COUNT(*) as count FROM applications GROUP BY status ORDER BY count DESC`)

	respond(w, http.StatusOK, map[string]interface{}{
		"total_applications":   totalApplications,
		"total_services":       totalServices,
		"total_users":          totalUsers,
		"pending_applications": pendingApplications,
		"by_status":            byStatus,
	})
}
