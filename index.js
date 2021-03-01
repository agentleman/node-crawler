const cheerio = require("cheerio"); //转对象模块
const Koa = require("koa"); //搭建服务模块
const Router = require("koa-router");
const charset = require("superagent-charset");
const superagent = charset(require("superagent")); //发送请求模块 一个轻量的ajax API
const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");
const _ = require("lodash");
const moment = require("moment");

const App = new Koa();
const router = new Router();
var arr = [];
var j, h;

router.get("/", async (ctx, next) => {
  let url = "https://s.weibo.com/top/summary?cate=realtimehot"; //target地址
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
        });
      //用cheerio解析页面数据
      this.arr = [];
      // cheerio的使用类似jquery的操作
      let that = this;
      $("table tbody tr").each((index, element) => {
        let $element = $(element);
        that.arr.push({
          title: $element.find(".td-02").find("a").text(),
          url:
            $element.find(".td-02").find("a").attr("href_to") ||
            $element.find(".td-02").find("a").attr("href"),
        });
      });
      getDayFile(that.arr);
    });
  // await next()
  ctx.response.body = this.arr;
});

function query_hot() {
  let url = "https://s.weibo.com/top/summary?cate=realtimehot"; //target地址
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
        });
      //用cheerio解析页面数据
      // cheerio的使用类似jquery的操作
      $("table tbody tr").each((index, element) => {
        let $element = $(element);
        arr.push({
          title: $element.find(".td-02").find("a").text(),
          url:
            $element.find(".td-02").find("a").attr("href_to") ||
            $element.find(".td-02").find("a").attr("href"),
        });
      });
    });
}

App.use(router.routes()).use(router.allowedMethods());

//隔一小时页面提取一次
function scheduleSetHour() {
  //定制器规则参数 依次是 秒、分、时、月、年、周几 留星号默认每秒执行一次
  j = schedule.scheduleJob("59 1 * * * *", function () {
    query_hot();
  });
}
scheduleSetHour();

//隔一天汇总一次当天提取结果
function scheduleSetDay() {
  h = schedule.scheduleJob("59 59 23 * * *", function () {
    j.cancel();
    //使用lodash的isEqual方法去重
    var uniqHolderArr = _.uniqWith(arr, _.isEqual);
    getDayFile(uniqHolderArr);
    arr = [];
    scheduleSetHour();
  });
}
scheduleSetDay();

// 生成汇总文件
function getDayFile(infoArr) {
  let dateNow = moment(new Date().getTime()).format("YYYY-MM-DD");
  writeIn(0, dateNow + "热点", infoArr);
}
function writeIn(count, dateNow, infoArr) {
  count = Number(count);
  if (count === infoArr.length - 1) return;
  fs.appendFileSync(
    "hot/" + dateNow + ".md",
    count +
      1 +
      ".[" +
      infoArr[count].title +
      "]" +
      "(https://s.weibo.com" +
      infoArr[count].url +
      ")</br>",
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  count++;
  // 递归写入搜集的条目
  writeIn(count, dateNow, infoArr);
}
// 服务监听


App.listen("8088", () => {
  console.log("8088");
});
