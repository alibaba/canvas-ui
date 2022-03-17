// @ts-nocheck
import React from 'react';
import { dynamic } from 'dumi';
import rawCode1 from '!!dumi-raw-code-loader!/Users/kk/dev/canvas-ui/packages/site/docs/demo.tsx?dumi-raw-code';

export default {
  'getting-started-demo': {
    component: function DumiDemo() {
      var _interopRequireDefault = require("/Users/kk/dev/canvas-ui/node_modules/@umijs/babel-preset-umi/node_modules/@babel/runtime/helpers/interopRequireDefault");

      var _react = _interopRequireDefault(require("react"));

      var _react2 = require("@canvas-ui/react");

      var _default = function _default() {
        return /*#__PURE__*/_react["default"].createElement("div", {
          style: {
            height: '200px'
          }
        }, /*#__PURE__*/_react["default"].createElement(_react2.Canvas, null, /*#__PURE__*/_react["default"].createElement(_react2.Flex, {
          style: {
            width: 100
          }
        }, /*#__PURE__*/_react["default"].createElement(_react2.Text, null, "Dog"), /*#__PURE__*/_react["default"].createElement(_react2.Text, null, "Cat"))));
      };

      return _react["default"].createElement(_default);
    },
    previewerProps: { "sources": { "_": { "jsx": "import React from 'react'\nimport { Canvas, Text, Flex } from '@canvas-ui/react'\n\nexport default () => {\n  return (\n    <div style={{ height: '200px' }}>\n      <Canvas>\n        <Flex style={{ width: 100 }}>\n          <Text>Dog</Text>\n          <Text>Cat</Text>\n        </Flex>\n      </Canvas>\n    </div>\n  )\n}\n" } }, "dependencies": { "react": { "version": "16.8.6" }, "@canvas-ui/react": { "version": "0.6.27-alpha.1" } }, "identifier": "getting-started-demo" },
  },
  'docs-demo': {
    component: (require('/Users/kk/dev/canvas-ui/packages/site/docs/demo.tsx')).default,
    previewerProps: { "sources": { "_": { "tsx": rawCode1 } }, "dependencies": { "react": { "version": "16.8.6" }, "@canvas-ui/react": { "version": "0.6.27-alpha.1" } }, "identifier": "docs-demo" },
  },
};
