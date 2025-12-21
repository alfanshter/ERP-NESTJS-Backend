# Company Logo Upload API Documentation

## Overview
API ini memungkinkan superadmin untuk upload logo company saat membuat atau mengupdate company.

## Features
- ✅ Upload logo saat create company
- ✅ Upload/update logo saat update company
- ✅ Validasi file type (JPEG, PNG only)
- ✅ Validasi file size (max 1MB)
- ✅ Auto-generate unique filename
- ✅ Auto-delete old logo saat update
- ✅ Auto-delete logo saat delete company
- ✅ Serve static files untuk akses logo

## Technical Specifications

### File Requirements
- **Required**: No (Optional)
- **Allowed Types**: `image/jpeg`, `image/png`
- **Max Size**: 1MB (1048576 bytes)
- **Recommended Dimensions**: 200x200 - 500x500 px
- **Aspect Ratio**: 1:1 (square recommended)
- **Storage**: File disimpan di `uploads/logos/`
- **Database**: URL string disimpan di field `logo`

### Filename Format
Generated automatically: `logo-{timestamp}-{random}.{extension}`

Example: `logo-1703151234567-987654321.png`

## API Endpoints

### 1. Create Company with Logo

**Endpoint**: `POST /superadmin/companies`

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
name: "PT Example Company" (required)
email: "contact@example.com" (optional)
phone: "+62812345678" (optional)
address: "Jl. Example No. 123" (optional)
website: "https://example.com" (optional)
status: "ACTIVE" (optional, enum: ACTIVE|SUSPENDED|TRIAL|INACTIVE)
subscriptionId: "uuid" (optional)
logo: [file] (optional, image file)
```

**cURL Example**:
```bash
curl --location 'http://localhost:3000/superadmin/companies' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--form 'name="PT Technology Indonesia"' \
--form 'email="info@techindo.com"' \
--form 'phone="+628123456789"' \
--form 'address="Jl. Sudirman No. 123, Jakarta"' \
--form 'website="https://techindo.com"' \
--form 'status="ACTIVE"' \
--form 'logo=@"/path/to/logo.png"'
```

**Success Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "PT Technology Indonesia",
  "email": "info@techindo.com",
  "phone": "+628123456789",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "logo": "http://localhost:3000/uploads/logos/logo-1703151234567-987654321.png",
  "website": "https://techindo.com",
  "status": "ACTIVE",
  "subscriptionId": null,
  "createdAt": "2025-12-21T10:00:00.000Z",
  "updatedAt": "2025-12-21T10:00:00.000Z"
}
```

**Error Responses**:

**400 Bad Request** (Invalid file type):
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPEG and PNG images are allowed. Received: image/gif",
  "error": "Bad Request"
}
```

**400 Bad Request** (File too large):
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 1MB. File size: 1.5MB",
  "error": "Bad Request"
}
```

### 2. Update Company with Logo

**Endpoint**: `PATCH /superadmin/companies/:id`

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
name: "PT Example Company Updated" (optional)
email: "newemail@example.com" (optional)
phone: "+62812345679" (optional)
address: "New Address" (optional)
website: "https://newwebsite.com" (optional)
status: "SUSPENDED" (optional)
logo: [file] (optional, new image file)
```

**cURL Example**:
```bash
curl --location --request PATCH 'http://localhost:3000/superadmin/companies/COMPANY_UUID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--form 'name="PT Technology Indonesia (Updated)"' \
--form 'logo=@"/path/to/new-logo.png"'
```

**Notes**:
- Jika upload logo baru, logo lama akan otomatis dihapus dari server
- Bisa update tanpa upload logo baru (logo lama tetap ada)

### 3. Get Company (Lihat Logo URL)

**Endpoint**: `GET /superadmin/companies/:id`

**Response**:
```json
{
  "id": "uuid",
  "name": "PT Technology Indonesia",
  "logo": "http://localhost:3000/uploads/logos/logo-1703151234567-987654321.png",
  ...
}
```

### 4. Access Logo File

Logo dapat diakses langsung melalui URL:
```
http://localhost:3000/uploads/logos/logo-1703151234567-987654321.png
```

## Testing with Postman

### 1. Setup Collection

Import atau create new request dengan:
- **Method**: POST
- **URL**: `{{baseUrl}}/superadmin/companies`
- **Headers**: 
  - `Authorization`: `Bearer {{token}}`
- **Body**: 
  - Type: `form-data`

### 2. Add Form Fields

| Key | Type | Value | Required |
|-----|------|-------|----------|
| name | Text | PT Example | Yes |
| email | Text | info@example.com | No |
| phone | Text | +628123456789 | No |
| address | Text | Jl. Example No. 123 | No |
| website | Text | https://example.com | No |
| status | Text | ACTIVE | No |
| logo | File | [Select File] | No |

### 3. Select Logo File

1. Click pada field `logo`
2. Pilih type: `File`
3. Click "Select Files"
4. Pilih image file (PNG atau JPEG, max 1MB)

### 4. Send Request

Click "Send" button dan check response.

## JavaScript/TypeScript Example

```typescript
// Using Axios
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function createCompanyWithLogo() {
  const formData = new FormData();
  formData.append('name', 'PT Technology Indonesia');
  formData.append('email', 'info@techindo.com');
  formData.append('phone', '+628123456789');
  formData.append('address', 'Jl. Sudirman No. 123');
  formData.append('website', 'https://techindo.com');
  formData.append('status', 'ACTIVE');
  
  // Append logo file
  const logoFile = fs.createReadStream('/path/to/logo.png');
  formData.append('logo', logoFile);

  try {
    const response = await axios.post(
      'http://localhost:3000/superadmin/companies',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        }
      }
    );
    
    console.log('Company created:', response.data);
    console.log('Logo URL:', response.data.logo);
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
}

createCompanyWithLogo();
```

## Frontend Example (React with Axios)

```tsx
import React, { useState } from 'react';
import axios from 'axios';

function CreateCompanyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    status: 'ACTIVE'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size
      if (file.size > 1048576) {
        alert('File size must be less than 1MB');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPEG and PNG images are allowed');
        return;
      }
      
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    data.append('website', formData.website);
    data.append('status', formData.status);
    
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/superadmin/companies',
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      alert('Company created successfully!');
      console.log('Logo URL:', response.data.logo);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create company');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Company Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />
      {logoFile && <p>Selected: {logoFile.name}</p>}
      
      <button type="submit">Create Company</button>
    </form>
  );
}

export default CreateCompanyForm;
```

## File Structure

```
erp-backend/
├── uploads/
│   └── logos/
│       └── logo-1703151234567-987654321.png
├── src/
│   ├── common/
│   │   └── helpers/
│   │       └── file-upload.helper.ts
│   ├── superadmin/
│   │   └── companies/
│   │       ├── companies.controller.ts
│   │       ├── companies.service.ts
│   │       └── dto/
│   │           ├── create-company.dto.ts
│   │           └── update-company.dto.ts
│   └── main.ts
```

## Error Handling

### Common Errors

1. **File too large**: Max 1MB exceeded
2. **Invalid file type**: Only JPEG/PNG allowed
3. **Unauthorized**: Invalid or missing JWT token
4. **Company not found**: Invalid company ID for update
5. **Validation error**: Missing required fields

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

## Security Notes

1. ✅ File type validation (JPEG, PNG only)
2. ✅ File size validation (max 1MB)
3. ✅ JWT authentication required
4. ✅ Role-based access (superadmin only)
5. ✅ Unique filename generation (prevent overwrite)
6. ✅ Auto-cleanup old files

## Best Practices

1. **Image Optimization**: 
   - Compress images before upload
   - Use square aspect ratio (1:1)
   - Recommended: 200x200 - 500x500 px

2. **Error Handling**:
   - Always catch and handle upload errors
   - Validate file on client-side before upload
   - Show user-friendly error messages

3. **Performance**:
   - Consider using CDN for production
   - Implement image caching
   - Use lazy loading for logo display

## Production Considerations

### 1. Cloud Storage (Recommended)

For production, consider using cloud storage like:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Cloudinary

### 2. Environment Variables

Add to `.env`:
```
UPLOAD_DIR=./uploads/logos
MAX_FILE_SIZE=1048576
ALLOWED_MIME_TYPES=image/jpeg,image/png
```

### 3. Image Processing

Consider adding:
- Image resizing
- Format conversion
- Thumbnail generation
- Image optimization

### 4. CDN Integration

For better performance:
- Serve images through CDN
- Enable caching headers
- Use image optimization services

## Troubleshooting

### Issue: Logo tidak muncul (404)

**Solution**:
1. Check apakah file ada di `uploads/logos/`
2. Verify static assets configuration di `main.ts`
3. Check URL format di response

### Issue: Upload failed (413 Payload Too Large)

**Solution**:
1. Compress image file
2. Check file size < 1MB
3. Verify server body parser limits

### Issue: CORS error saat upload

**Solution**:
1. Add frontend origin ke CORS config
2. Include `multipart/form-data` in allowed headers

## Support

Untuk pertanyaan atau issue, silakan hubungi development team.
