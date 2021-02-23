const cheerio = require("cheerio"); //转对象模块
const Koa = require("koa"); //搭建服务模块
const Router = require("koa-router");
const charset = require("superagent-charset");
const superagent = charset(require("superagent")); //发送请求模块 一个轻量的ajax API

const App = new Koa();
const router = new Router();
// const arr = []

router.get("/", (ctx, next) => {
  let url = "https://s.weibo.com/top/summary?cate=realtimehot"; //target地址
  // let url = "https://segmentfault.com/a/1190000016655289"; //target地址
  
  // let arr = [];

  superagent
    .get(url)
    .charset("utf-8")
    .buffer(true)
    .end((err, data) => {
      if (err) {
        console.log("页面不存在", err);
      }
      let html = data.text,
        $ = cheerio.load(html, {
          decodeEntities: false,
          ignoreWhitespace: false,
          xmlMode: false,
          lowerCaseTags: false,
        }),
        //用cheerio解析页面数据
        obj = {};
       arr = [];
      // cheerio的使用类似jquery的操作
      $("table tbody tr").each((index, element) => {
        let $element = $(element);
        arr.push({
          title: $element.find(".td-02").find("a").text(),
          url: $element.find(".td-02").find("a").attr("href"),
        });
      });
    });
  ctx.body = this.arr;
});

App.use(router.routes()).use(router.allowedMethods());

App.listen("8088", () => {
  console.log("8088");
  console.log(cheerio);
});
