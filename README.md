# webpack-demo
编写一个简单的webpack

运行方式:node ./index.js

流程分析

1.读取入口文件的内容

2.利用babel，将文件内容转为ast语法树

3.从ast语法树中收集文件的依赖，将文件中的es module转为common.js的内容

4.根据依赖，递归的方式（图的广度优先遍历）构建一个图的数据结构

5.使用ejs将数据转为bundle.js

6.输出到指定目录
