// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from '/Users/kk/dev/canvas-ui/node_modules/umi/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/~demos/:uuid",
    "layout": false,
    "wrappers": [require('../dumi/layout').default],
    "component": ((props) => {
        const React = require('react');
        const { default: getDemoRenderArgs } = require('/Users/kk/dev/canvas-ui/node_modules/@umijs/preset-dumi/lib/plugins/features/demo/getDemoRenderArgs');
        const { default: Previewer } = require('dumi-theme-default/es/builtins/Previewer.js');
        const { usePrefersColor, context } = require('dumi/theme');

        
      const { demos } = React.useContext(context);
      const [renderArgs, setRenderArgs] = React.useState([]);

      // update render args when props changed
      React.useLayoutEffect(() => {
        setRenderArgs(getDemoRenderArgs(props, demos));
      }, [props.match.params.uuid, props.location.query.wrapper, props.location.query.capture]);

      // for listen prefers-color-schema media change in demo single route
      usePrefersColor();

      switch (renderArgs.length) {
        case 1:
          // render demo directly
          return renderArgs[0];

        case 2:
          // render demo with previewer
          return React.createElement(
            Previewer,
            renderArgs[0],
            renderArgs[1],
          );

        default:
          return `Demo ${props.match.params.uuid} not found :(`;
      }
    
        })
  },
  {
    "path": "/_demos/:uuid",
    "redirect": "/~demos/:uuid"
  },
  {
    "__dumiRoot": true,
    "layout": false,
    "path": "/",
    "wrappers": [require('../dumi/layout').default, require('/Users/kk/dev/canvas-ui/node_modules/dumi-theme-default/es/layout.js').default],
    "routes": [
      {
        "path": "/getting-started",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/getting-started.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/getting-started.md",
          "updatedTime": 1647095749997,
          "nav": {
            "title": "Getting Started",
            "order": 1,
            "path": "/getting-started"
          },
          "slugs": [
            {
              "depth": 1,
              "value": "Getting Started",
              "heading": "getting-started"
            },
            {
              "depth": 2,
              "value": "Inline",
              "heading": "inline"
            },
            {
              "depth": 2,
              "value": "External",
              "heading": "external"
            }
          ],
          "title": "Getting Started",
          "hasPreviewer": true
        },
        "title": "Getting Started - Site Name"
      },
      {
        "path": "/zh-CN/getting-started",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/getting-started.zh-CN.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/getting-started.zh-CN.md",
          "updatedTime": 1647094537320,
          "nav": {
            "title": "快速上手",
            "order": 1,
            "path": "/zh-CN/getting-started"
          },
          "slugs": [
            {
              "depth": 1,
              "value": "快速上手",
              "heading": "快速上手"
            }
          ],
          "title": "快速上手",
          "locale": "zh-CN"
        },
        "title": "快速上手 - Site Name"
      },
      {
        "path": "/help",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/help.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/help.md",
          "updatedTime": 1647094537320,
          "slugs": [],
          "nav": {
            "path": "/help",
            "title": "Help"
          },
          "title": "Help"
        },
        "title": "Help - Site Name"
      },
      {
        "path": "/zh-CN/help",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/help.zh-CN.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/help.zh-CN.md",
          "updatedTime": 1647094537321,
          "nav": {
            "title": "帮助",
            "path": "/zh-CN/help"
          },
          "slugs": [
            {
              "depth": 1,
              "value": "帮助",
              "heading": "帮助"
            }
          ],
          "title": "帮助",
          "locale": "zh-CN"
        },
        "title": "帮助 - Site Name"
      },
      {
        "path": "/",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/index.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/index.md",
          "updatedTime": 1647094537322,
          "hero": {
            "title": "Site Name",
            "desc": "<div class=\"markdown\"><p>dumi site app example</p></div>",
            "actions": [
              {
                "text": "Getting Started",
                "link": "/getting-started"
              }
            ]
          },
          "features": [
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png",
              "title": "Feature 1",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            },
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/d60657df-0822-4631-9d7c-e7a869c2f21c/k79dmz3q_w126_h126.png",
              "title": "Feature 2",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            },
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/d1ee0c6f-5aed-4a45-a507-339a4bfe076c/k7bjsocq_w144_h144.png",
              "title": "Feature 3",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            }
          ],
          "footer": "<div class=\"markdown\"><p>Open-source MIT Licensed | Copyright © 2020<br />Powered by <a href=\"https://d.umijs.org/\" target=\"_blank\">dumi<svg xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 100\" width=\"15\" height=\"15\" class=\"__dumi-default-external-link-icon\"><path fill=\"currentColor\" d=\"M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z\"></path><polygon fill=\"currentColor\" points=\"45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9\"></polygon></svg></a></p></div>",
          "slugs": [
            {
              "depth": 2,
              "value": "Hello dumi!",
              "heading": "hello-dumi"
            }
          ],
          "title": "Hello dumi!"
        },
        "title": "Hello dumi! - Site Name"
      },
      {
        "path": "/zh-CN",
        "component": require('/Users/kk/dev/canvas-ui/packages/site/docs/index.zh-CN.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/index.zh-CN.md",
          "updatedTime": 1647094537322,
          "hero": {
            "title": "Site Name",
            "desc": "<div class=\"markdown\"><p>dumi site app 脚手架</p></div>",
            "actions": [
              {
                "text": "快速上手",
                "link": "/getting-started"
              }
            ]
          },
          "features": [
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png",
              "title": "特性 1",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            },
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/d60657df-0822-4631-9d7c-e7a869c2f21c/k79dmz3q_w126_h126.png",
              "title": "特性 2",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            },
            {
              "icon": "https://gw.alipayobjects.com/zos/bmw-prod/d1ee0c6f-5aed-4a45-a507-339a4bfe076c/k7bjsocq_w144_h144.png",
              "title": "特性 3",
              "desc": "<div class=\"markdown\"><p>Balabala</p></div>"
            }
          ],
          "footer": "<div class=\"markdown\"><p>Open-source MIT Licensed | Copyright © 2020<br />Powered by <a href=\"https://d.umijs.org/\" target=\"_blank\">dumi<svg xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 100\" width=\"15\" height=\"15\" class=\"__dumi-default-external-link-icon\"><path fill=\"currentColor\" d=\"M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z\"></path><polygon fill=\"currentColor\" points=\"45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9\"></polygon></svg></a></p></div>",
          "slugs": [
            {
              "depth": 2,
              "value": "Hello dumi!",
              "heading": "hello-dumi"
            }
          ],
          "title": "Hello dumi!",
          "locale": "zh-CN"
        },
        "title": "Hello dumi! - Site Name"
      }
    ],
    "title": "Site Name",
    "component": (props) => props.children
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
