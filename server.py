import tornado.web
from tornado.options import define, options, parse_command_line
import os
import logging
import uploadhandler
import casehandler


class UpdateHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('upload.html')

    def post(self):
        new_html = 'new-html'
        user_name = self.get_body_argument('user-name', default='')
        user_pwd = self.get_body_argument('user-pwd', default='')

        validation = False
        if user_name in ['xhzy'] and user_pwd == 'Updat3@S3rv3r':
            validation = True

        if validation and new_html in self.request.files:
            file = self.request.files[new_html][0]
            filename = 'templates/index.html'
            with open(filename, 'wb') as f:
                f.write(file['body'])
                logging.info('uploading new page succeed!')
            self.write({'result': 'okay'})
        else:
            self.write({'result': 'parameters error, need new-html keyword and user-name, user-pwd'})


class NewIndex(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')


def main():
    define("debug", default=False, help="run in debug mode")
    define("port", default=1234, help="run server on given port", type=int)
    parse_command_line()
    application = tornado.web.Application(
        [
            (r"/", NewIndex),
            (r"/update-page/", UpdateHandler),
            (r"/img/(.*)", uploadhandler.ImageHandler,
             dict(upload_path="static/images/", naming_strategy=None)),
            (r"/check", uploadhandler.CheckHandler,
             dict(upload_path="static/images/", naming_strategy=None)),
        ],
        debug=True,
        template_path=os.path.join(os.path.dirname(__file__), "./templates"),
        static_path=os.path.join(os.path.dirname(__file__), "./static"),
        xsrf_cookies=False,
    )
    application.listen(options.port)
    logging.info("Server running on port %d", options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

