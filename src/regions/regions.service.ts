import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegionLevel } from '@prisma/client';

export interface RegionSearchResult {
  id: string;
  fullName: string; // "Gondangwetan, Pasuruan, Jawa Timur"
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search regions by multiple keywords (modern autocomplete style)
   * Examples:
   * - "wonosari" → all regions named wonosari
   * - "wonosari gond" → wonosari in gondangwetan district (partial match)
   * - "wonosari pasuruan" → all wonosari in pasuruan city
   * - "menteng jak" → menteng in jakarta (partial match)
   */
  async search(query: string, limit = 10): Promise<RegionSearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    // Split query into keywords for better matching
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length >= 2);

    if (keywords.length === 0) {
      return [];
    }

    // For single keyword: simple search
    // For multiple keywords: search by FIRST keyword, then filter by ALL keywords
    const primaryKeyword = keywords[0];

    // Search in villages and districts - match primary keyword in any level
    const regions = await this.prisma.region.findMany({
      where: {
        level: {
          in: [RegionLevel.VILLAGE, RegionLevel.DISTRICT],
        },
        OR: [
          // Match primary keyword in region name
          { name: { contains: primaryKeyword, mode: 'insensitive' as const } },
          // Match in parent (district)
          {
            parent: {
              name: { contains: primaryKeyword, mode: 'insensitive' as const },
            },
          },
          // Match in grandparent (city)
          {
            parent: {
              parent: {
                name: { contains: primaryKeyword, mode: 'insensitive' as const },
              },
            },
          },
          // Match in great-grandparent (province)
          {
            parent: {
              parent: {
                parent: {
                  name: {
                    contains: primaryKeyword,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true, // Province level
              },
            },
          },
        },
      },
      take: 500, // Get more to filter - we'll filter in memory
      orderBy: {
        name: 'asc',
      },
    });

    // Filter results: ALL keywords must match somewhere in the full hierarchy text
    const filteredRegions = regions.filter((region) => {
      const searchableText = this.buildSearchableText(region).toLowerCase();
      return keywords.every((keyword) => searchableText.includes(keyword));
    });

    // Build full hierarchy for each result and limit
    return filteredRegions
      .slice(0, limit)
      .map((region) => this.buildSearchResult(region));
  }

  /**
   * Build searchable text from region and its parents
   */
  private buildSearchableText(region: any): string {
    const parts: string[] = [region.name];

    if (region.parent) {
      parts.push(region.parent.name);
      if (region.parent.parent) {
        parts.push(region.parent.parent.name);
        if (region.parent.parent.parent) {
          parts.push(region.parent.parent.parent.name);
        }
      }
    }

    return parts.join(' ');
  }

  /**
   * Get region by ID with full hierarchy
   */
  async findById(id: string): Promise<RegionSearchResult | null> {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
      },
    });

    if (!region) {
      return null;
    }

    return this.buildSearchResult(region);
  }

  /**
   * Get all provinces
   */
  async getProvinces() {
    return this.prisma.region.findMany({
      where: { level: RegionLevel.PROVINCE },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get children by parent ID (for drill-down if needed)
   */
  async getChildren(parentId: string) {
    return this.prisma.region.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get region statistics
   */
  async getStats() {
    const [provinces, cities, districts, villages] = await Promise.all([
      this.prisma.region.count({ where: { level: RegionLevel.PROVINCE } }),
      this.prisma.region.count({ where: { level: RegionLevel.CITY } }),
      this.prisma.region.count({ where: { level: RegionLevel.DISTRICT } }),
      this.prisma.region.count({ where: { level: RegionLevel.VILLAGE } }),
    ]);

    return {
      provinces,
      cities,
      districts,
      villages,
      total: provinces + cities + districts + villages,
    };
  }

  /**
   * Build search result with full hierarchy names
   */
  private buildSearchResult(region: any): RegionSearchResult {
    const result: RegionSearchResult = {
      id: region.id,
      fullName: '',
      postalCode: region.postalCode,
      latitude: region.latitude,
      longitude: region.longitude,
    };

    // Build hierarchy based on level
    const names: string[] = [];

    if (region.level === RegionLevel.VILLAGE) {
      result.village = region.name;
      names.push(region.name);

      if (region.parent) {
        result.district = region.parent.name;
        names.push(region.parent.name);

        if (region.parent.parent) {
          result.city = region.parent.parent.name;
          names.push(region.parent.parent.name);

          if (region.parent.parent.parent) {
            result.province = region.parent.parent.parent.name;
            names.push(region.parent.parent.parent.name);
          }
        }
      }
    } else if (region.level === RegionLevel.DISTRICT) {
      result.district = region.name;
      names.push(region.name);

      if (region.parent) {
        result.city = region.parent.name;
        names.push(region.parent.name);

        if (region.parent.parent) {
          result.province = region.parent.parent.name;
          names.push(region.parent.parent.name);
        }
      }
    } else if (region.level === RegionLevel.CITY) {
      result.city = region.name;
      names.push(region.name);

      if (region.parent) {
        result.province = region.parent.name;
        names.push(region.parent.name);
      }
    } else if (region.level === RegionLevel.PROVINCE) {
      result.province = region.name;
      names.push(region.name);
    }

    result.fullName = names.join(', ');

    return result;
  }

  /**
   * Get Prisma include config for full region hierarchy
   * Use this in other services to include region with all parent levels
   */
  static getFullRegionInclude(): any {
    return {
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true, // Province (max 4 levels)
              },
            },
          },
        },
      },
    };
  }
}
