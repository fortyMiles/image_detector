import tornado.web
from tornado.options import define, options, parse_command_line
import os
import logging
import uploadhandler
import casehandler

class UploadForm(tornado.web.RequestHandler):
    def get(self):
        left = 'images/left1.jpg'
        right = 'images/right1.jpg'
        params = {
            "similarity": 'NO',
            "ratio": '12.3%',
            "location": "",
            "image1": self.static_url(left),
            "image2": self.static_url(right),
            "placeholder1": "static/" + left,
            "placeholder2": "static/" + right,
        }
        self.render("index-demo.html", **params)

    def post(self):
        print('post one thing!')


class ParticularHandler(tornado.web.RequestHandler):
    def get(self):

        self.render('particular.html')


class CasesHandler(tornado.web.RequestHandler):
    def get(self):
        lefts, rights, results = casehandler.get_cases_pics()
        params = {
            "similarities": results,
            "lefts": lefts,
            "rights": rights,
        }
        self.render('cases-demo.html', **params)


class NewIndex(tornado.web.RequestHandler):
    def get(self):
        left = 'img/bird1.jpg'
        right = 'img/bird2.jpg'
        params = {
            "similarity": 'NO',
            "ratio": '12.3%',
            "location": "",
            "image1": self.static_url(left),
            "image2": self.static_url(right),
            "placeholder1": "static/" + left,
            "placeholder2": "static/" + right,
        }
        self.render('index-demo.html', **params)


def main():
    define("debug", default=False, help="run in debug mode")
    define("port", default=1234, help="run server on given port", type=int)
    parse_command_line()
    application = tornado.web.Application(
        [
            (r"/", NewIndex),
            (r"/upload", uploadhandler.UploadHandler,
             dict(upload_path="static/images/", naming_strategy=None)),
            (r"/cool", ParticularHandler),
            (r"/cases", CasesHandler),
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

