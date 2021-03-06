import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import path from "path";
import ejs from "ejs";
import { transformFromAst } from "babel-core";
import { loadJson } from "./loaders/jsonLoader.js";

let webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: loadJson,
      },
    ],
  },
};

let id = 0;
function createAsset(filePath) {
  //1.获取文件内容
  let source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // initLoad
  const loaders = webpackConfig.module.rules;
  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      source = use(source);
    }
  });

  //2.获取文件依赖,使用babel从ast语法树中查找
  //	 ast: 抽象语法树
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });
  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });

  return {
    filePath,
    code,
    deps,
    mapping: {},
    id: id++,
  };
}

//根据依赖关系生成一个图结构
function createGraph() {
  const mainAsset = createAsset("./example/main.js");
  const queue = [mainAsset];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve("./example", relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }
  return queue;
}

const graph = createGraph();

function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });
  const data = graph.map((asset) => {
    const { id, code, mapping } = asset;
    return {
      id,
      code,
      mapping,
    };
  });
  const code = ejs.render(template, { data });
  fs.writeFileSync("./dist/bundle.js", code);
}

build(graph);
