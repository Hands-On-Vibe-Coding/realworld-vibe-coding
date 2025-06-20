package utils

import (
	"regexp"
	"strings"
	"unicode"
)

// GenerateSlug generates a URL-friendly slug from a title
func GenerateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^\p{L}\p{N}]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	return slug
}

// IsValidSlug checks if a string is a valid slug
func IsValidSlug(slug string) bool {
	if len(slug) == 0 {
		return false
	}
	
	for _, r := range slug {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '-' {
			return false
		}
	}
	
	return !strings.HasPrefix(slug, "-") && !strings.HasSuffix(slug, "-")
}