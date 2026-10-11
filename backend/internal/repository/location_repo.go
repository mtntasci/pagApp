package repository

import (
	"context"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
	"pag-backend/internal/model"
)

// LocationRepo handles queries for Turkey locations (cities, districts, neighborhoods)
type LocationRepo struct {
	db     *pgxpool.Pool
	cached []model.City
	mu     sync.RWMutex
}

// NewLocationRepo creates a new LocationRepo instance
func NewLocationRepo(db *pgxpool.Pool) *LocationRepo {
	return &LocationRepo{
		db: db,
	}
}

// GetLocations retrieves the full hierarchy of cities, districts, and neighborhoods with in-memory caching
func (r *LocationRepo) GetLocations(ctx context.Context) ([]model.City, error) {
	r.mu.RLock()
	if len(r.cached) > 0 {
		cachedCopy := r.cached
		r.mu.RUnlock()
		return cachedCopy, nil
	}
	r.mu.RUnlock()

	r.mu.Lock()
	defer r.mu.Unlock()

	// Double-check after acquiring write lock
	if len(r.cached) > 0 {
		return r.cached, nil
	}

	locations, err := r.loadFromDB(ctx)
	if err != nil {
		return nil, err
	}

	r.cached = locations
	return locations, nil
}

// Reload forces a fresh reload from the database
func (r *LocationRepo) Reload(ctx context.Context) error {
	locations, err := r.loadFromDB(ctx)
	if err != nil {
		return err
	}

	r.mu.Lock()
	r.cached = locations
	r.mu.Unlock()
	return nil
}

func (r *LocationRepo) loadFromDB(ctx context.Context) ([]model.City, error) {
	// 1. Fetch all cities
	cityRows, err := r.db.Query(ctx, `SELECT id, name FROM cities ORDER BY id ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query cities: %w", err)
	}
	defer cityRows.Close()

	var cities []model.City
	cityMap := make(map[string]*model.City)

	for cityRows.Next() {
		var c model.City
		if err := cityRows.Scan(&c.ID, &c.Name); err != nil {
			return nil, fmt.Errorf("failed to scan city: %w", err)
		}
		c.Districts = []model.District{}
		cities = append(cities, c)
	}
	if err := cityRows.Err(); err != nil {
		return nil, fmt.Errorf("error reading cities: %w", err)
	}

	for i := range cities {
		cityMap[cities[i].ID] = &cities[i]
	}

	// 2. Fetch all districts
	distRows, err := r.db.Query(ctx, `SELECT id, city_id, name FROM districts ORDER BY id ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query districts: %w", err)
	}
	defer distRows.Close()

	distMap := make(map[string]*model.District)
	for distRows.Next() {
		var d model.District
		var cityID string
		if err := distRows.Scan(&d.ID, &cityID, &d.Name); err != nil {
			return nil, fmt.Errorf("failed to scan district: %w", err)
		}
		d.CityID = cityID
		d.Neighborhoods = []model.Neighborhood{}

		if parentCity, ok := cityMap[cityID]; ok {
			parentCity.Districts = append(parentCity.Districts, d)
			// Map to pointer inside parent city slice
			distMap[d.ID] = &parentCity.Districts[len(parentCity.Districts)-1]
		}
	}
	if err := distRows.Err(); err != nil {
		return nil, fmt.Errorf("error reading districts: %w", err)
	}

	// 3. Fetch all neighborhoods
	nhRows, err := r.db.Query(ctx, `SELECT id, district_id, name FROM neighborhoods ORDER BY id ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query neighborhoods: %w", err)
	}
	defer nhRows.Close()

	for nhRows.Next() {
		var nh model.Neighborhood
		var distID string
		if err := nhRows.Scan(&nh.ID, &distID, &nh.Name); err != nil {
			return nil, fmt.Errorf("failed to scan neighborhood: %w", err)
		}
		if parentDist, ok := distMap[distID]; ok {
			parentDist.Neighborhoods = append(parentDist.Neighborhoods, nh)
		}
	}
	if err := nhRows.Err(); err != nil {
		return nil, fmt.Errorf("error reading neighborhoods: %w", err)
	}

	return cities, nil
}
