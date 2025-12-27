# Employee Photo Upload Documentation

## Overview
Employee photo upload menggunakan **multipart/form-data** dengan automatic image processing (resize, convert to WebP, compress).

## Features

### ✅ Automatic Image Processing
Setiap foto yang di-upload akan otomatis diproses:

1. **Resize**: Maksimal 800x800px (maintains aspect ratio)
2. **Convert**: Semua format (JPG, PNG, GIF) di-convert ke **WebP**
3. **Compress**: Quality 85% untuk optimal size
4. **Clean**: EXIF data dihapus untuk privacy
5. **Delete Old**: Foto lama otomatis dihapus saat upload foto baru

### 📁 File Storage
- **Location**: `./uploads/employees/`
- **Filename Format**: `employee-{timestamp}-{random}.webp`
- **Max Size**: 5MB
- **Allowed Types**: JPG, JPEG, PNG, GIF, WebP

## API Endpoints

### 1. Create Employee with Photo

**Endpoint**: `POST /company/employees`

**Content-Type**: `multipart/form-data`

**Form Fields**:
```
employeeCode: "EMP001"
firstName: "John"
lastName: "Doe"
email: "john@company.com"
phone: "+628123456789"
photo: [FILE] // Optional - Upload image file here
position: "Software Engineer"
department: "IT"
salary: "15000000"
joinDate: "2024-01-15T00:00:00.000Z"
status: "ACTIVE"
regionId: "35.14.18.2007"
address: "Jl. Raya No. 123"
postalCode: "67153"
roleId: "{{staff_role_id}}"
```

**Response**:
```json
{
  "id": "uuid",
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "photo": "/uploads/employees/employee-1640000000000-123456789.webp",
  "position": "Software Engineer",
  "status": "ACTIVE",
  ...
}
```

### 2. Update Employee Photo

**Endpoint**: `PATCH /company/employees/:id`

**Content-Type**: `multipart/form-data`

**Form Fields** (semua optional):
```
photo: [FILE] // New photo file - old photo will be deleted
position: "Senior Software Engineer"
salary: "20000000"
status: "ACTIVE"
```

**Response**:
```json
{
  "id": "uuid",
  "photo": "/uploads/employees/employee-1640999999999-987654321.webp",
  "position": "Senior Software Engineer",
  "salary": "20000000",
  ...
}
```

## Postman Usage

### Create Employee with Photo:
1. Pilih request "1. Create Employee"
2. Pilih tab **Body** → **form-data**
3. Pada field **photo**:
   - Type: **file**
   - Click **"Select Files"**
   - Pilih image file (JPG, PNG, GIF, WebP)
   - Max 5MB
4. Isi field lain (employeeCode, firstName, lastName, email, dll)
5. Send request
6. Check response - photo path akan otomatis `.webp`

### Update Employee Photo:
1. Pilih request "5. Update Employee by ID"
2. Pilih tab **Body** → **form-data**
3. Pada field **photo**:
   - Click **"Select Files"**
   - Pilih image file baru
4. Isi field lain yang mau di-update (optional)
5. Send request
6. Foto lama akan otomatis terhapus

## Frontend Implementation

### React/Next.js Example:

```typescript
// Create Employee with Photo
async function createEmployee(formData: FormData) {
  const response = await fetch('/api/company/employees', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData, // multipart/form-data
  });
  
  return await response.json();
}

// Usage
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('employeeCode', 'EMP001');
  formData.append('firstName', 'John');
  formData.append('lastName', 'Doe');
  formData.append('email', 'john@company.com');
  
  // Photo upload
  const photoFile = photoInputRef.current?.files?.[0];
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  
  formData.append('position', 'Software Engineer');
  formData.append('department', 'IT');
  formData.append('salary', '15000000');
  formData.append('joinDate', new Date().toISOString());
  formData.append('status', 'ACTIVE');
  
  const result = await createEmployee(formData);
  console.log('Photo path:', result.photo); // /uploads/employees/employee-xxx.webp
};
```

### HTML Form Example:

```html
<form id="employeeForm" enctype="multipart/form-data">
  <input type="text" name="employeeCode" value="EMP001" required>
  <input type="text" name="firstName" value="John" required>
  <input type="text" name="lastName" value="Doe" required>
  <input type="email" name="email" value="john@company.com" required>
  
  <!-- Photo Upload -->
  <input 
    type="file" 
    name="photo" 
    accept="image/jpeg,image/png,image/gif,image/webp"
    onchange="previewPhoto(this)"
  >
  <img id="photoPreview" style="max-width: 200px;">
  
  <input type="text" name="position" value="Software Engineer">
  <input type="text" name="department" value="IT">
  <input type="number" name="salary" value="15000000">
  <input type="datetime-local" name="joinDate">
  
  <select name="status">
    <option value="ACTIVE">Active</option>
    <option value="INACTIVE">Inactive</option>
  </select>
  
  <button type="submit">Create Employee</button>
</form>

<script>
function previewPhoto(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('photoPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById('employeeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/company/employees', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const result = await response.json();
  alert('Employee created! Photo: ' + result.photo);
});
</script>
```

## Technical Details

### Backend Flow:

1. **Upload**: Client sends multipart/form-data dengan photo file
2. **Save**: Multer menyimpan file ke `./uploads/employees/` dengan nama temporary
3. **Process**: Sharp library:
   - Resize ke max 800x800px
   - Convert ke WebP format
   - Compress dengan quality 85%
   - Save dengan nama `.webp`
4. **Delete**: File original (JPG/PNG) dihapus
5. **Database**: Path WebP disimpan ke database (`/uploads/employees/employee-xxx.webp`)
6. **Response**: Return employee data dengan photo path

### Update Flow:

1. **Check**: Cek apakah employee punya foto lama
2. **Delete Old**: Kalau ada foto lama, hapus file dari disk
3. **Upload New**: Upload dan process foto baru (resize, convert, compress)
4. **Update DB**: Update photo path di database
5. **Response**: Return employee data dengan photo path baru

### Why WebP?

- **Smaller Size**: 25-35% lebih kecil dari JPEG dengan quality sama
- **Better Quality**: Quality lebih baik pada compression level sama
- **Wide Support**: Supported di semua modern browsers
- **Faster Load**: File lebih kecil = loading lebih cepat

### File Validation:

```typescript
// Allowed MIME types
const allowedTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// Max file size: 5MB
const maxSize = 5 * 1024 * 1024;

// File filter di multer config
if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
  throw new Error('Only image files allowed!');
}
```

## Error Handling

### Common Errors:

1. **File too large**: 
   ```json
   {
     "statusCode": 400,
     "message": "File too large. Max size: 5MB"
   }
   ```

2. **Invalid file type**:
   ```json
   {
     "statusCode": 400,
     "message": "Only image files are allowed! (jpg, jpeg, png, gif, webp)"
   }
   ```

3. **Processing failed**:
   ```json
   {
     "statusCode": 400,
     "message": "Failed to process employee photo"
   }
   ```

## Security Considerations

1. **File Type Validation**: Only images allowed (no executables)
2. **Size Limit**: Max 5MB to prevent abuse
3. **EXIF Removal**: Privacy protection (location, camera info removed)
4. **Unique Filenames**: Prevent filename conflicts and guessing
5. **Storage Outside Public**: `./uploads/` not in `/public/` folder

## Performance Optimization

1. **WebP Format**: 30% smaller than JPEG
2. **Compression**: 85% quality optimal for web
3. **Resize**: Max 800x800px reduces file size significantly
4. **Delete Old**: Prevents storage bloat
5. **Async Processing**: Non-blocking file operations

## Monitoring & Maintenance

### Check Disk Usage:
```bash
# Check uploads folder size
du -sh ./uploads/employees/

# Count files
ls -1 ./uploads/employees/ | wc -l

# Find large files
find ./uploads/employees/ -size +1M -ls
```

### Cleanup Old Photos:
```bash
# Find orphaned photos (not in database)
# Run script to compare database photo paths vs files on disk

# Delete files older than 6 months (if not in DB)
find ./uploads/employees/ -mtime +180 -type f -delete
```

## Related Files

- `src/common/helpers/employee-photo-upload.helper.ts` - Photo upload & processing logic
- `src/company/employees/employees.controller.ts` - Endpoints with FileInterceptor
- `src/company/employees/employees.service.ts` - Delete old photo logic
- `prisma/schema.prisma` - Employee.photo field (String?)

## See Also

- [Employee Login Guide](./EMPLOYEE_LOGIN_GUIDE.md)
- [Employee Address Update](./EMPLOYEE_ADDRESS_UPDATE.md)
- [Postman Employee Login](./POSTMAN_EMPLOYEE_LOGIN.md)
