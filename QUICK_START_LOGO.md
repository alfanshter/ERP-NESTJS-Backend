# Quick Start - Company Logo Upload

## 📋 Summary

Fitur upload logo untuk company telah ditambahkan dengan spesifikasi:
- ✅ **File Types**: JPEG, PNG only
- ✅ **Max Size**: 1MB
- ✅ **Optional**: Logo tidak wajib diupload
- ✅ **Auto Storage**: File disimpan di `uploads/logos/`
- ✅ **Auto Cleanup**: Logo lama otomatis dihapus saat update/delete
- ✅ **URL Format**: `http://localhost:3000/uploads/logos/logo-{timestamp}-{random}.{ext}`

## 🚀 Quick Test

### 1. Start Server
```bash
cd /Users/macbook/Documents/Website/Management\ PTPWS/starter/backend/erp-backend
pnpm run start:dev
```

### 2. Test dengan cURL

**Create Company dengan Logo:**
```bash
curl --location 'http://localhost:3000/superadmin/companies' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--form 'name="PT Test Company"' \
--form 'email="test@company.com"' \
--form 'status="ACTIVE"' \
--form 'logo=@"/path/to/your/logo.png"'
```

**Tanpa Logo (Optional):**
```bash
curl --location 'http://localhost:3000/superadmin/companies' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--header 'Content-Type: multipart/form-data' \
--form 'name="PT Test Company"' \
--form 'email="test@company.com"' \
--form 'status="ACTIVE"'
```

### 3. Test dengan Postman

1. Import collection: `Company-Logo-Upload.postman_collection.json`
2. Run "Login Superadmin" untuk get token
3. Run "Create Company WITH Logo"
4. Pilih image file (PNG/JPEG, < 1MB)
5. Send request
6. Check response untuk logo URL

## 📁 Files Changed

### New Files:
- ✅ `src/common/helpers/file-upload.helper.ts` - File upload utilities
- ✅ `LOGO_UPLOAD_API.md` - Complete API documentation
- ✅ `Company-Logo-Upload.postman_collection.json` - Postman test collection
- ✅ `QUICK_START_LOGO.md` - This file

### Modified Files:
- ✅ `src/superadmin/companies/dto/create-company.dto.ts` - Added @IsUrl validation
- ✅ `src/superadmin/companies/companies.controller.ts` - Added FileInterceptor
- ✅ `src/superadmin/companies/companies.service.ts` - Added logo cleanup logic
- ✅ `src/main.ts` - Added static assets serving
- ✅ `package.json` - Added multer dependencies

## 📚 Documentation

Lihat dokumentasi lengkap di: **`LOGO_UPLOAD_API.md`**

Includes:
- API Endpoints detail
- Request/Response examples
- Error handling
- Frontend integration examples (React, Axios)
- Testing guide
- Production considerations

## ✅ Features Implemented

1. **Upload on Create**
   - POST `/superadmin/companies` dengan form-data
   - Field `logo` adalah optional

2. **Upload on Update**
   - PATCH `/superadmin/companies/:id` dengan form-data
   - Old logo otomatis dihapus jika upload logo baru

3. **Auto Delete on Remove**
   - DELETE `/superadmin/companies/:id`
   - Logo file otomatis dihapus dari server

4. **File Validation**
   - Type checking: JPEG, PNG only
   - Size checking: Max 1MB
   - Error messages yang jelas

5. **Static File Serving**
   - Logo accessible via: `http://localhost:3000/uploads/logos/{filename}`
   - CORS configured untuk frontend access

## 🎯 Testing Checklist

- [ ] Create company dengan logo
- [ ] Create company tanpa logo
- [ ] Update company dengan logo baru (old logo should be deleted)
- [ ] Update company tanpa change logo
- [ ] Delete company (logo should be deleted)
- [ ] Test invalid file type (GIF, BMP, etc) - should fail
- [ ] Test file size > 1MB - should fail
- [ ] Access logo URL directly in browser
- [ ] Get company list and verify logo URLs

## 🔧 Environment Setup

Pastikan server running:
```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## 📸 Logo URL Format

```
http://localhost:3000/uploads/logos/logo-1703151234567-987654321.png
                                     ↑                    ↑
                                 timestamp            random
```

## 🐛 Troubleshooting

**Logo tidak muncul (404)?**
- Check file exists: `ls uploads/logos/`
- Verify static assets config in `main.ts`

**Upload gagal?**
- Check file size < 1MB
- Check file type (PNG/JPEG only)
- Verify JWT token valid

**CORS error?**
- Add frontend URL to CORS config in `main.ts`

## 💡 Next Steps (Optional Enhancements)

1. **Image Processing**
   - Add image resizing
   - Generate thumbnails
   - Compress images

2. **Cloud Storage**
   - Migrate to AWS S3
   - Use Cloudinary
   - Implement CDN

3. **Validation**
   - Check image dimensions
   - Verify aspect ratio (1:1)
   - Image quality checks

4. **Performance**
   - Add caching headers
   - Implement lazy loading
   - Optimize image delivery

## 📞 Support

Untuk issue atau pertanyaan, check dokumentasi lengkap di `LOGO_UPLOAD_API.md`
