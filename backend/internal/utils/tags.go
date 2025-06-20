package utils

import (
	"strings"
)

// NormalizeTags processes a list of tags by:
// - Removing empty tags
// - Trimming whitespace
// - Converting to lowercase
// - Removing duplicates
func NormalizeTags(tags []string) []string {
	if len(tags) == 0 {
		return []string{}
	}

	// Use a map to track unique tags
	tagMap := make(map[string]bool)
	var normalized []string

	for _, tag := range tags {
		// Trim whitespace and convert to lowercase
		cleanTag := strings.TrimSpace(strings.ToLower(tag))
		
		// Skip empty tags
		if cleanTag == "" {
			continue
		}
		
		// Skip if we've already seen this tag
		if tagMap[cleanTag] {
			continue
		}
		
		// Add to our results
		tagMap[cleanTag] = true
		normalized = append(normalized, cleanTag)
	}

	return normalized
}

// ValidateTag checks if a tag is valid
func ValidateTag(tag string) bool {
	cleanTag := strings.TrimSpace(tag)
	
	// Empty tags are invalid
	if cleanTag == "" {
		return false
	}
	
	// Tags longer than 50 characters are invalid
	if len(cleanTag) > 50 {
		return false
	}
	
	// Tags should not contain special characters (allow alphanumeric, dash, underscore)
	for _, char := range cleanTag {
		if !((char >= 'a' && char <= 'z') || 
			 (char >= 'A' && char <= 'Z') || 
			 (char >= '0' && char <= '9') || 
			 char == '-' || char == '_') {
			return false
		}
	}
	
	return true
}

// SanitizeTag cleans up a tag for storage
func SanitizeTag(tag string) string {
	// Trim and lowercase
	cleanTag := strings.TrimSpace(strings.ToLower(tag))
	
	// Replace spaces with dashes
	cleanTag = strings.ReplaceAll(cleanTag, " ", "-")
	
	// Remove multiple consecutive dashes
	for strings.Contains(cleanTag, "--") {
		cleanTag = strings.ReplaceAll(cleanTag, "--", "-")
	}
	
	// Trim dashes from beginning and end
	cleanTag = strings.Trim(cleanTag, "-")
	
	return cleanTag
}