import tornado.web
from tornado.options import define, options, parse_command_line
import os
import logging
import uploadhandler
import casehandler


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

