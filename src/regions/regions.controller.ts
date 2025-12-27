import { Controller, Get, Query, Param } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  /**
   * Search regions by keyword (autocomplete)
   * GET /regions/search?q=gondangwetan+pasuruan&limit=10
   *
   * Returns list of matching villages/districts with full hierarchy
   */
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.regionsService.search(query, limitNum);
  }

  /**
   * Get region by ID with full hierarchy
   * GET /regions/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const region = await this.regionsService.findById(id);
    if (!region) {
      return { message: 'Region not found' };
    }
    return region;
  }

  /**
   * Get all provinces
   * GET /regions/provinces
   */
  @Get('list/provinces')
  async getProvinces() {
    return this.regionsService.getProvinces();
  }

  /**
   * Get children by parent ID
   * GET /regions/children/:parentId
   */
  @Get('children/:parentId')
  async getChildren(@Param('parentId') parentId: string) {
    return this.regionsService.getChildren(parentId);
  }

  /**
   * Get region statistics
   * GET /regions/stats
   */
  @Get('list/stats')
  async getStats() {
    return this.regionsService.getStats();
  }
}
