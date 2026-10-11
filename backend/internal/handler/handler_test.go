package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"pag-backend/internal/model"
)

func TestHealthAndHelperResponses(t *testing.T) {
	// Test writeSuccess
	w := httptest.NewRecorder()
	writeSuccess(w, map[string]string{"test": "ok"}, "Success message")

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var resp model.APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Errorf("expected success true, got false")
	}
	if resp.Message != "Success message" {
		t.Errorf("expected message 'Success message', got '%s'", resp.Message)
	}

	// Test writeError
	wErr := httptest.NewRecorder()
	writeError(wErr, "Sample error", http.StatusBadRequest)

	if wErr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", wErr.Code)
	}

	var errResp model.APIResponse
	if err := json.NewDecoder(wErr.Body).Decode(&errResp); err != nil {
		t.Fatalf("failed to decode error response: %v", err)
	}

	if errResp.Success {
		t.Errorf("expected success false, got true")
	}
	if errResp.Error != "Sample error" {
		t.Errorf("expected error 'Sample error', got '%s'", errResp.Error)
	}
}
