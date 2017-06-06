import tornado.web
import logging
import os
import uuid
import random


def uuid_naming_strategy(original_name):
    "File naming strategy that ignores original name and returns an UUID"
    return str(uuid.uuid4())


class UploadHandler(tornado.web.RequestHandler):
    "Handle file uploads."

    def initialize(self, upload_path, naming_strategy):
        """Initialize with given upload path and naming strategy.
        :keyword upload_path: The upload path.
        :type upload_path: str
        :keyword naming_strategy: File naming strategy.
        :type naming_strategy: (str) -> str function
        """
        self.upload_path = upload_path
        if naming_strategy is None:
            naming_strategy = uuid_naming_strategy
        self.naming_strategy = naming_strategy

    def post(self):
        first_file = self.request.files['filearg1'][0]
        second_file = self.request.files['filearg2'][0]

        first_filename = first_file['filename']
        second_filename = second_file['filename']
        try:
            files = [first_file, second_file]
            for file in files:
                with open(os.path.join(self.upload_path, file['filename']), 'w') as fh:
                    fh.write(file['body'])
                    logging.info("%s uploaded %s, saved as %s",
                                 str(self.request.remote_ip),
                                 str(file['filename']),
                                 str(file['filename']))

            params = {
                'similarity': random.choice(['YES', 'NO']),
                'ratio': "{}%".format(random.random()*100),
                'location': 'show',
                'image1': self.static_url('images/{}'.format(first_filename)),
                'image2': self.static_url('images/{}'.format(second_filename)),
            }

            self.render("index.html", **params)

        except IOError as e:
            logging.error("Failed to write file due to IOError %s", str(e))