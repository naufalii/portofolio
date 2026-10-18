import os
import httpx
from fastapi import APIRouter, Response

router = APIRouter()

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "naufalii")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

@router.get("/api/github")
@router.get("/github")
async def get_github_repos(response: Response):
    """
    Proxies recent GitHub repositories for GITHUB_USERNAME.
    Caches on Vercel CDN via Cache-Control header.
    Returns only essential sanitized repo metadata per Section 9.4.
    """
    url = f"https://api.github.com/users/{GITHUB_USERNAME}/repos?sort=pushed&per_page=6"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Naufal-Portfolio-Serverless",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            gh_res = await client.get(url, headers=headers)

        if gh_res.status_code != 200:
            return {
                "success": False,
                "error": "Gagal mengambil data dari GitHub API",
                "repos": []
            }

        raw_repos = gh_res.json()
        sanitized_repos = []

        for repo in raw_repos:
            # Skip forks if preferred, or include only owned
            sanitized_repos.append({
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "pushed_at": repo.get("pushed_at"),
                "url": repo.get("html_url"),
            })

        # Set CDN Cache headers per Section 9.4
        response.headers["Cache-Control"] = "s-maxage=3600, stale-while-revalidate=86400"

        return {
            "success": True,
            "username": GITHUB_USERNAME,
            "repos": sanitized_repos
        }

    except Exception as e:
        return {
            "success": False,
            "error": "Koneksi ke GitHub API gagal",
            "repos": []
        }
