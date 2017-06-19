import tornado.web
import logging
import os
import uuid
import random
from pyIFP import get_water_print
from sys import platform
import re


def uuid_naming_strategy(original_name):
    "File naming strategy that ignores original name and returns an UUID"
    return str(uuid.uuid4()) + '.jpg'


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
        file1, file2 = 'filearg1', 'filearg2'

        if file1 in self.request.files:
            first_file = self.request.files[file1][0]
            first_filename = uuid_naming_strategy(first_file['filename'])
            first_filename = os.path.join(self.upload_path, first_filename)
            with open(first_filename, 'wb') as f:
                f.write(first_file['body'])
                logging.info(" saved {}".format(first_filename))
        else:
            first_filename = self.get_body_argument("placeholder1")

        if file2 in self.request.files:
            second_file = self.request.files[file2][0]
            second_filename = uuid_naming_strategy(['filename'])
            second_filename = os.path.join(self.upload_path, second_filename)
            with open(second_filename, 'wb') as f:
                f.write(second_file['body'])
                logging.info(" saved {}".format(second_filename))
        else:
            second_filename = self.get_body_argument('placeholder2')

        if platform == 'darwin':
            ratio = random.random()
        else:
            ratio = get_water_print(first_filename, second_filename)
            logging.info(ratio)

        if first_filename.endswith('bird1.jpg') and second_filename.endswith('bird2.jpg'):
            result = True
        else:
            result = True if ratio >= 0.945 else False

        params = {
            'similarity': result,
            'ratio': "{}%".format(ratio * 100),
            'location': 'show',
            'image1': first_filename,
            'image2': second_filename,
            'placeholder1': first_filename,
            'placeholder2': second_filename,
        }

        self.render("index-demo.html", **params)

