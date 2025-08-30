// src/services/organizationService.ts
import { Organization } from '../types';

class OrganizationService {
    private readonly STORAGE_KEY = 'selected_organization_slug';
    private readonly DEFAULT_SLUG = process.env.REACT_APP_ORGANIZATION_SLUG;

    /**
     * Get the currently selected organization slug from memory
     * Falls back to environment variable or first available organization
     */
    getSelectedOrganizationSlug(availableOrganizations?: Organization[]): string | null {
        // Try to get from memory (session storage equivalent using in-memory storage)
        const stored = this.getStoredSlug();
        if (stored) return stored;

        // Try environment variable
        if (this.DEFAULT_SLUG) {
            const envOrgExists = availableOrganizations?.some(org => org.slug === this.DEFAULT_SLUG);
            if (envOrgExists) return this.DEFAULT_SLUG;
        }

        // Fall back to first available organization
        if (availableOrganizations && availableOrganizations.length > 0) {
            return availableOrganizations[0].slug;
        }

        return null;
    }

    /**
     * Set the selected organization slug
     */
    setSelectedOrganizationSlug(slug: string): void {
        // Store in memory for the session
        this.setStoredSlug(slug);
    }

    /**
     * Clear the selected organization
     */
    clearSelectedOrganization(): void {
        this.clearStoredSlug();
    }

    /**
     * Check if an organization slug is valid among available organizations
     */
    isValidOrganizationSlug(slug: string, availableOrganizations: Organization[]): boolean {
        return availableOrganizations.some(org => org.slug === slug && org.isActive);
    }

    /**
     * Get organization by slug from available organizations
     */
    getOrganizationBySlug(slug: string, availableOrganizations: Organization[]): Organization | undefined {
        return availableOrganizations.find(org => org.slug === slug && org.isActive);
    }

    /**
     * Get debugging information about organization state
     */
    getDebugInfo(availableOrganizations?: Organization[]): object {
        return {
            storedSlug: this.getStoredSlug(),
            defaultSlug: this.DEFAULT_SLUG,
            availableOrganizations: availableOrganizations?.map(org => ({
                slug: org.slug,
                name: org.name,
                isActive: org.isActive,
                projectCount: org.projectsCount
            })) || [],
            selectedSlug: this.getSelectedOrganizationSlug(availableOrganizations),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                REACT_APP_GRAPHQL_URI: process.env.REACT_APP_GRAPHQL_URI,
                REACT_APP_DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE
            }
        };
    }

    // In-memory storage since we can't use localStorage in Claude artifacts
    private memoryStorage: Record<string, string> = {};

    private getStoredSlug(): string | null {
        return this.memoryStorage[this.STORAGE_KEY] || null;
    }

    private setStoredSlug(slug: string): void {
        this.memoryStorage[this.STORAGE_KEY] = slug;
    }

    private clearStoredSlug(): void {
        delete this.memoryStorage[this.STORAGE_KEY];
    }
}

// Export singleton instance
export const organizationService = new OrganizationService();

// Hook for React components
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ORGANIZATIONS } from '../graphql/queries';

export interface UseOrganizationReturn {
    organizations: Organization[];
    selectedOrganization: Organization | null;
    selectedOrganizationSlug: string | null;
    loading: boolean;
    error: any;
    setSelectedOrganization: (slug: string) => void;
    clearSelection: () => void;
    debugInfo: object;
}

export function useOrganization(): UseOrganizationReturn {
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    const { data, loading, error } = useQuery<{ organizations: Organization[] }>(GET_ORGANIZATIONS);

    const organizations = data?.organizations || [];

    // Initialize selected organization when data loads
    useEffect(() => {
        if (organizations.length > 0 && !selectedSlug) {
            const autoSelectedSlug = organizationService.getSelectedOrganizationSlug(organizations);
            if (autoSelectedSlug) {
                setSelectedSlug(autoSelectedSlug);
                organizationService.setSelectedOrganizationSlug(autoSelectedSlug);
            }
        }
    }, [organizations, selectedSlug]);

    const selectedOrganization = selectedSlug
        ? organizationService.getOrganizationBySlug(selectedSlug, organizations) || null
        : null;

    const setSelectedOrganization = (slug: string) => {
        if (organizationService.isValidOrganizationSlug(slug, organizations)) {
            setSelectedSlug(slug);
            organizationService.setSelectedOrganizationSlug(slug);
        } else {
            console.warn(`Invalid organization slug: ${slug}`);
        }
    };

    const clearSelection = () => {
        setSelectedSlug(null);
        organizationService.clearSelectedOrganization();
    };

    const debugInfo = organizationService.getDebugInfo(organizations);

    return {
        organizations,
        selectedOrganization,
        selectedOrganizationSlug: selectedSlug,
        loading,
        error,
        setSelectedOrganization,
        clearSelection,
        debugInfo
    };
}