const cheerio = require("cheerio"); //转对象模块
const Koa = require("koa"); //搭建服务模块
const Router = require("koa-router");
const charset = require("superagent-charset");
const superagent = charset(require("superagent")); //发送请求模块 一个轻量的ajax API

const App = new Koa();
const router = new Router();

// const url = "https://www.baidu.com";
// router.get("/", (ctx, next) => {
//   ctx.body = " 程序创建成功！";
// });

router.get("/", (ctx, next) => {
  url = "https://s.weibo.com/top/summary?cate=realtimehot"; //target地址
  superagent
    .get(url)
    .charset("utf-8")
    .buffer(true)
    .end((err, data) => {
      if (err) {
        console.log("页面不存在", err);
      }
      // console.log("=======================" + JSON.stringify(data.text));
      let html = data.text,
        $ = cheerio.load(html, {
          decodeEntities: false,
          ignoreWhitespace: false,
          xmlMode: false,
          lowerCaseTags: false,
        }), //用cheerio解析页面数据
        obj = {};
      arr = [];
      // cheerio的使用类似jquery的操作
      $("table tbody").each((index, element) => {
        let $element = $(element);
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'+$element)
        // console.log(JSON.stringify($element.find("a").text()));
        // $element
        //   .find(".td-02")
        //   .next()
        //   .find("a")
        //   .addClass("link")
        //   .attr("class", "link")
        //   .text("");
        // arr.push({
        //   title: $element.find("a.blue14b").text(),
        //   image: $element.find("#bright img").attr("src"),
        //   summary: $element.find("#tctitle").next().text(),
        //   is_cgiia:
        //     $element.find("#tctitle font").attr("color") === "green" ? 1 : 0,
        // });
        arr.push({
          title: $element.find("a").text(),
          url: $element.find("a").attr("href"),
        });
      });
    });
  ctx.body = arr;
  // ctx.body = data;
});

App.use(router.routes()).use(router.allowedMethods());

App.listen("31001", () => {
  console.log("服务已启动！！！");
  console.log(cheerio);
});
