import type {Config} from '@docusaurus/types';
const config: Config = {
  title: 'three-vpl', tagline: 'Let light bounce.', url: 'https://bhouston.github.io', baseUrl: '/three-vpl/',
  organizationName: 'bhouston', projectName: 'three-vpl', onBrokenLinks: 'throw',
  presets: [['classic', {docs: {sidebarPath: './sidebars.ts'}, blog: false, theme: {customCss: './src/css/custom.css'}}]],
  themeConfig: {
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {title: 'three-vpl', items: [{to: '/demo', label: 'Live demo', position: 'left'}, {to: '/docs/intro', label: 'Guide', position: 'left'}, {to: '/docs/api', label: 'API', position: 'left'}, {href: 'https://github.com/bhouston/three-vpl', label: 'GitHub', position: 'right'}]},
    footer: {style: 'dark', copyright: `MIT licensed · Built by Ben Houston · Based on research in instant radiosity`},
    prism: {additionalLanguages: ['javascript', 'typescript']}
  }
};
export default config;
