# Blog App Features Documentation

## 1. Comments System

### Models
- **Comment Model** (`models/comment.model.js`)
  - `content`: String (required, max 2000 chars)
  - `author`: Reference to User (required)
  - `post`: Reference to Post (required)
  - `likes`: Array of User references
  - `timestamps`: Auto-tracked (createdAt, updatedAt)

### API Endpoints

#### Get Comments for a Post
```
GET /api/v1/posts/:postId/comments?page=1&limit=10
Authorization: Bearer <token>
Response: { status, data: [comments], pagination: { page, limit, total, pages } }
```

#### Create Comment
```
POST /api/v1/posts/:postId/comments
Authorization: Bearer <token>
Body: { content: "Comment text" }
Response: { status, data: comment }
```

#### Update Comment
```
PATCH /api/v1/posts/:postId/comments/:commentId
Authorization: Bearer <token>
Body: { content: "Updated comment text" }
Response: { status, data: comment }
- Only the comment author or superadmin can update
```

#### Delete Comment
```
DELETE /api/v1/posts/:postId/comments/:commentId
Authorization: Bearer <token>
Response: { status, data: null }
- Only the comment author or superadmin can delete
```

#### Like/Unlike Comment
```
POST /api/v1/posts/:postId/comments/:commentId/like
Authorization: Bearer <token>
Response: { status, data: comment }
- Toggles like status for the authenticated user
```

---

## 2. Likes System

### Post Likes
- Posts have a `likes` array containing User IDs
- Users can like/unlike posts

#### Like/Unlike Post
```
POST /api/v1/posts/:id/like
Authorization: Bearer <token>
Response: { status, data: post }
- Toggles like status for the authenticated user
- Returns post with populated likes array
```

### Comment Likes
- Comments have a `likes` array containing User IDs
- Users can like/unlike comments
- See Comment endpoints above

---

## 3. Pagination

### Get Posts with Pagination
```
GET /api/v1/posts?page=1&limit=10
Authorization: Bearer <token>
Response: {
  status: "success",
  data: [posts],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    pages: 5
  }
}
```

### Get Comments with Pagination
```
GET /api/v1/posts/:postId/comments?page=1&limit=10
Authorization: Bearer <token>
Response: {
  status: "success",
  data: [comments],
  pagination: {
    page: 1,
    limit: 10,
    total: 25,
    pages: 3
  }
}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

## 4. Search Posts

### Search by Title or Content
```
GET /api/v1/posts?search=keyword&page=1&limit=10
Authorization: Bearer <token>
Response: {
  status: "success",
  data: [matching_posts],
  pagination: { page, limit, total, pages }
}
```

**Features:**
- Case-insensitive search
- Searches both title and content
- Works with pagination
- Only returns posts user has access to (global + group posts)

**Example:**
```
GET /api/v1/posts?search=mongodb&page=1&limit=5
```

---

## 5. Rate Limiting

### Rate Limits Applied

#### 1. General API Limiter
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applied to**: All routes

#### 2. Authentication Limiter
- **Window**: 15 minutes
- **Limit**: 5 attempts per IP
- **Applied to**: `/api/v1/auth` routes
- **Purpose**: Prevent brute force attacks

#### 3. Post Creation Limiter
- **Window**: 1 hour
- **Limit**: 20 posts per hour per user
- **Applied to**: `POST /api/v1/posts`
- **Bypass**: Superadmin users are exempt

#### 4. Comment Creation Limiter
- **Window**: 1 minute
- **Limit**: 10 comments per minute per user
- **Applied to**: `POST /api/v1/posts/:postId/comments`
- **Bypass**: Superadmin users are exempt

### Rate Limit Response Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

### Rate Limit Exceeded Response
```
HTTP 429 Too Many Requests
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Files Created/Modified

### New Files Created:
1. `models/comment.model.js` - Comment schema
2. `controllers/comment.controller.js` - Comment endpoints logic
3. `services/comment.services.js` - Comment business logic
4. `routes/comment.route.js` - Comment API routes
5. `validations/comment.validation.js` - Comment input validation
6. `middleware/rate-limit.middleware.js` - Rate limiting configuration

### Files Modified:
1. `models/post.model.js` - Added likes array
2. `controllers/post.controller.js` - Added pagination, search, like endpoint
3. `services/post.services.js` - Added pagination, search, like logic
4. `routes/post.route.js` - Added comment routes, like endpoint, rate limiters
5. `app.js` - Integrated rate limiting middleware

---

## Usage Examples

### Example 1: Create a Post and Get Comments with Pagination
```bash
# Create a post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -F "title=Learning MongoDB" \
  -F "content=MongoDB is awesome" \
  -F "images=@image.jpg"

# Add a comment
curl -X POST http://localhost:3000/api/v1/posts/POST_ID/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'

# Get comments with pagination
curl http://localhost:3000/api/v1/posts/POST_ID/comments?page=1&limit=5 \
  -H "Authorization: Bearer <token>"
```

### Example 2: Search Posts and Like
```bash
# Search posts
curl "http://localhost:3000/api/v1/posts?search=mongodb&page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Like a post
curl -X POST http://localhost:3000/api/v1/posts/POST_ID/like \
  -H "Authorization: Bearer <token>"

# Like a comment
curl -X POST http://localhost:3000/api/v1/posts/POST_ID/comments/COMMENT_ID/like \
  -H "Authorization: Bearer <token>"
```

### Example 3: Handle Rate Limiting
```bash
# First request (succeeds)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# After 5 failed attempts within 15 minutes
# Response: HTTP 429 Too Many Requests
{
  "message": "Too many login attempts, please try again later."
}
```

---

## Database Indexes Recommended

For optimal performance, add these indexes:

```javascript
// In MongoDB
db.posts.createIndex({ title: "text", content: "text" })
db.posts.createIndex({ author: 1, createdAt: -1 })
db.comments.createIndex({ post: 1, createdAt: -1 })
db.comments.createIndex({ author: 1 })
```

---

## Next Steps & Enhancements

1. **Notifications**: Notify users when their post/comment is liked or commented on
2. **Trending**: Implement trending posts based on likes and comments
3. **Analytics**: Track post views and engagement metrics
4. **Advanced Search**: Add full-text search or Elasticsearch integration
5. **Moderation**: Add comment moderation system
6. **Soft Delete**: Implement soft deletes instead of hard deletes
7. **Caching**: Add Redis caching for frequently accessed posts/comments

---

## Troubleshooting

### Issue: Rate limit too strict
**Solution**: Adjust limits in `middleware/rate-limit.middleware.js`:
```javascript
max: 20 // Increase this value
```

### Issue: Comments not appearing
**Solution**: Ensure pagination query params are correct:
```
GET /api/v1/posts/POST_ID/comments?page=1&limit=10
```

### Issue: Search not working
**Solution**: Ensure search is URL-encoded if special characters:
```
GET /api/v1/posts?search=node%20js
```

### Issue: Like toggle not working
**Solution**: Check that user is authenticated and post/comment ID is valid

---

## Security Considerations

✅ **Implemented:**
- Authorization checks (only owners can edit/delete their posts/comments)
- Superadmin bypass for rate limiting
- Input validation with Joi schemas
- Rate limiting on sensitive operations
- Mongoose injection protection via schema validation

📋 **To Consider:**
- Add admin moderation panel for harmful comments
- Implement comment approval workflows
- Add blocking/muting users feature
- Implement audit logging for sensitive operations
