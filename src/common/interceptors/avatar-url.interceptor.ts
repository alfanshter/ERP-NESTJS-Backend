import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Interceptor to transform avatar/logo relative paths to full URLs in responses
 * Converts "avatars/filename.jpg" or "logos/filename.jpg" to "http://localhost:3000/uploads/avatars/filename.jpg"
 */
@Injectable()
export class AvatarUrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}/uploads`;

    return next.handle().pipe(
      map((data) => {
        return this.transformAvatarPaths(data, baseUrl);
      }),
    );
  }

  /**
   * Recursively transform avatar paths in response data
   */
  private transformAvatarPaths(data: any, baseUrl: string): any {
    if (!data) return data;

    // Handle array
    if (Array.isArray(data)) {
      return data.map((item) => this.transformAvatarPaths(item, baseUrl));
    }

    // Handle Date objects - don't transform them
    if (data instanceof Date) {
      return data;
    }

    // Handle object
    if (typeof data === 'object') {
      const transformed = { ...data };

      // Transform nested 'data' property (pagination responses)
      if (transformed.data && Array.isArray(transformed.data)) {
        transformed.data = transformed.data.map((item: any) =>
          this.transformAvatarPaths(item, baseUrl),
        );
      }

      // Transform avatar field if it exists and is a relative path
      if (transformed.avatar && typeof transformed.avatar === 'string') {
        // Only transform if it's a relative path (not already a full URL)
        if (!transformed.avatar.startsWith('http')) {
          transformed.avatar = `${baseUrl}/${transformed.avatar}`;
        }
      }

      // Transform logo field if it exists and is a relative path
      if (transformed.logo && typeof transformed.logo === 'string') {
        // Only transform if it's a relative path (not already a full URL)
        if (!transformed.logo.startsWith('http')) {
          transformed.logo = `${baseUrl}/${transformed.logo}`;
        }
      }

      // Recursively transform other nested objects
      for (const key in transformed) {
        if (
          key !== 'avatar' &&
          key !== 'logo' &&
          key !== 'data' &&
          transformed[key] !== null &&
          typeof transformed[key] === 'object' &&
          !(transformed[key] instanceof Date) // Skip Date objects
        ) {
          transformed[key] = this.transformAvatarPaths(
            transformed[key],
            baseUrl,
          );
        }
      }

      return transformed;
    }

    return data;
  }
}
