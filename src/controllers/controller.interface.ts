import { HttpServer } from '../server/http-server';

export interface Controller {
  /**
   * Khai báo các Routes ở init
   * @param HttpServer : ExpressServer
   *
   * RequestHandler tương ứng với route sẽ được gọi:
   *  + Ko có Argument vs bind: this.nameFunk.bind(this)
   *  + vs Argument vs call: call.nameFunk.call(this, par...)
   *    => vì call sẽ thực thi ngay và trả lại function dc Return
   *
   *  - this trong bind là HttpServer chứ ko phải là class này.
   */
  init(HttpServer: HttpServer): void;

  /*Tạo các ReuquestHandler tương ứng cho Routes*/

  /** => Nguyên tắc xử lý Request:
   *
   * + Validate đầu vào tại Controller
   * + Validate Entity tại Service
   * + Xử lý Error tại Controller vs next để ErrorHandler làm việc
   * + Throw Error tại Service => chú ý loại lỗi
   */
}
