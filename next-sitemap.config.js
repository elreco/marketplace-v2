/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_HOST_URL || 'https://www.nftcanyon.io',
    generateRobotsTxt: true,
}