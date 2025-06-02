# GitHub Pages Deployment Guide

This project includes a GitHub Actions CI/CD pipeline that automatically builds and deploys the application to GitHub Pages when changes are pushed to the main branch.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Save the settings

### 2. Repository Configuration

The workflow is configured to:

- Run on pushes to the `main` branch
- Run on pull requests for testing (without deployment)
- Build and test the application using pnpm
- Deploy only successful builds to GitHub Pages

### 3. Environment Variables (Optional)

If your repository name is not `username.github.io`, you may need to configure the base path for proper routing:

1. In `vite.config.ts`, add a base configuration:

```typescript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ... rest of config
});
```

2. Uncomment and adjust the environment variable in `.github/workflows/deploy.yml`:

```yaml
env:
  VITE_BASE_PATH: /${{ github.event.repository.name }}/
```

## Workflow Features

### Build and Test Job

- **Node.js Setup**: Uses Node.js 22
- **Package Manager**: Uses pnpm with caching for faster builds
- **Quality Checks**: Runs linting (`pnpm run lint`) and tests (`pnpm run test`)
- **Build Process**: Executes `pnpm run build` to create production assets
- **Artifact Upload**: Stores build output for deployment

### Deploy Job

- **Conditional Deployment**: Only runs on main branch pushes (not PRs)
- **GitHub Pages Integration**: Uses official GitHub Actions for Pages deployment
- **Secure Deployment**: Uses GitHub's built-in GITHUB_TOKEN with appropriate permissions

## Build Output

The build process:

1. Compiles TypeScript (`tsc`)
2. Builds the client application with Vite
3. Outputs static files to `dist/`
4. Uploads the build artifacts to GitHub Pages

## Accessing Your Deployed Site

After successful deployment, your site will be available at:

- `https://username.github.io/repository-name/` (for repository pages)
- `https://username.github.io/` (for user/organisation pages)

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the Actions tab for detailed error logs
2. **Missing Dependencies**: Ensure `pnpm-lock.yaml` is committed and all required types are installed
3. **Test Failures**: All tests must pass before deployment
4. **TypeScript Errors**: Ensure all imports are valid and unused variables are removed
5. **Routing Issues**: Configure base path if using a repository page
6. **API Call Failures**: Ensure calculations run client-side for static GitHub Pages deployment

### Recent Fixes Applied

- Added `@types/cors` to resolve TypeScript declaration errors
- Fixed unused variables in CostOverTimeChart component
- Removed unused imports to satisfy linting rules
- Configured Node.js 20 to match project requirements
- Fixed build output directory from `dist/client` to `dist` for proper artifact upload
- Updated Vite config to output to correct directory (`outDir: '../../dist'`)
- Added required `environment: github-pages` configuration for GitHub Pages deployment
- Configured base path for GitHub Pages repository deployment (`base: '/agentic_cost_calc/'`)
- Converted from API-based to client-side calculations for static deployment compatibility

### Monitoring Deployments

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Expand job details to see build and deployment logs
4. Check the **deploy** job for the deployment URL

## Manual Deployment

To manually trigger a deployment:

1. Push changes to the `main` branch
2. Or create a pull request and merge it to `main`

The workflow will automatically run and deploy if all checks pass.
