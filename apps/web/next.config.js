/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared'],

  // The old editor under /workflow was replaced by /workflows. Keep old links
  // working. Temporary (307) so the paths can be reused later.
  async redirects() {
    return [
      { source: '/workflow', destination: '/workflows', permanent: false },
      { source: '/workflow/new', destination: '/workflows', permanent: false },
      { source: '/workflow/:id/edit', destination: '/workflows/:id', permanent: false },
      { source: '/workflow/:id', destination: '/workflows/:id', permanent: false },
    ]
  },
}

module.exports = nextConfig
