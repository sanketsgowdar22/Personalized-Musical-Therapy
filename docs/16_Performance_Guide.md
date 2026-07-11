# ⚡ Performance Guide — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| API p95 latency | < 200ms | Prometheus/Grafana |
| API p99 latency | < 500ms | Prometheus/Grafana |
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| JS Bundle Size | < 500KB gzipped | Vite build |
| ML Inference (face) | < 500ms | Profiling |
| ML Inference (text) | < 300ms | Profiling |
| Lighthouse Score | ≥ 90 | Lighthouse |

---

## 2. Frontend Optimization

- **Code splitting**: Route-based lazy loading with `React.lazy` + `Suspense`
- **Tree shaking**: Vite production build eliminates dead code
- **Image optimization**: WebP format, responsive `srcset`, lazy loading
- **Caching**: Service worker for static assets, HTTP cache headers
- **Bundling**: Separate vendor chunks, preload critical resources
- **Fonts**: `font-display: swap`, subset to used characters
- **Rendering**: Virtual scrolling for long lists, debounced inputs

---

## 3. Backend Optimization

- **Async I/O**: All database and external API calls are async
- **Connection pooling**: SQLAlchemy async pool (min 5, max 20)
- **Caching**: Redis for session data, API responses, ML model results
- **Pagination**: Cursor-based for large datasets, limit + offset for small
- **Query optimization**: Indexed columns, eager loading, N+1 prevention
- **Compression**: gzip/brotli response compression
- **Rate limiting**: Per-endpoint limits to prevent abuse

---

## 4. ML Optimization

- **Model quantization**: INT8 quantization for inference (2-4x speedup)
- **Batch inference**: Process multiple inputs in batches where possible
- **Model caching**: Keep loaded models in memory (singleton pattern)
- **ONNX Runtime**: Export models to ONNX for faster CPU inference
- **Preprocessing**: Efficient numpy/OpenCV pipelines, avoid redundant operations

---

## 5. Database Optimization

- **Indexes**: On all FK columns, commonly filtered/sorted columns
- **Partitioning**: Time-based partitioning on emotion_detections (future)
- **Vacuum**: Regular autovacuum for PostgreSQL
- **Connection limits**: Configured per service with pooling
- **Read replicas**: Offload analytics queries to replicas (production)

---

## 6. Monitoring

- **Prometheus**: Metrics collection (request count, latency, error rate)
- **Grafana**: Dashboards for real-time monitoring
- **Sentry**: Error tracking with performance monitoring
- **Health checks**: `/api/v1/health` endpoint with dependency checks

---

> **Performance is a feature. Monitor, measure, and optimize continuously.**
