import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseURL = "https://byteshare.io"
  return [
    {
        url: baseURL,
        lastModified: new Date(),
        priority: 1,
    },
    {
        url: `${baseURL}/history`,
        lastModified: new Date(),
        priority: 0.8,
    },
    {
        url: `${baseURL}/auth/login`,
        lastModified: new Date(),
        priority: 0.5,
    },
    {
        url: `${baseURL}/auth/signup`,
        lastModified: new Date(),
        priority: 0.5,
    },
    {
        url: `${baseURL}/auth/terms`,
        lastModified: new Date(),
        priority: 0.5,
    }
  ]
}