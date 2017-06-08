import tornado.web
from tornado.options import define, options, parse_command_line
import os
import logging
import uploadhandler


class UploadForm(tornado.web.RequestHandler):
    def get(self):
        params = {
            "similarity": 'NO',
            "ratio": '12.3%',
            "location": "",
            "image1": self.static_url("img/portfolio/fullsize/1.jpg"),
            "image2": self.static_url("img/portfolio/fullsize/2.jpg"),
        }
        self.render("index.html", **params)

    def post(self):
        print('post one thing!')


class ParticularHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('particular.html')


if __name__ == "__main__":

    define("debug", default=False, help="run in debug mode")
    define("port", default=1234, help="run server on given port", type=int)
    parse_command_line()
    application = tornado.web.Application(
        [
            (r"/", UploadForm),
            (r"/upload", uploadhandler.UploadHandler,
             dict(upload_path="static/images/", naming_strategy=None)),
            (r"/cool", ParticularHandler),
        ],
        debug=True,
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        xsrf_cookies=False,
    )
    application.listen(options.port)
    logging.info("Server running on port %d", options.port)
    tornado.ioloop.IOLoop.instance().start()
