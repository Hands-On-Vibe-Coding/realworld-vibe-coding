package utils

import (
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"
)

// GenerateSlug creates a URL-friendly slug from a title
func GenerateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	// Add random suffix to ensure uniqueness
	rand.Seed(time.Now().UnixNano())
	suffix := rand.Intn(999999)
	
	return fmt.Sprintf("%s-%d", slug, suffix)
}