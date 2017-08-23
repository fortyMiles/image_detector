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


class ImageHandler(tornado.web.RequestHandler):
    def initialize(self, upload_path, naming_strategy):
        self.upload_path = upload_path
        if naming_strategy is None:
            naming_strategy = uuid_naming_strategy
        self.naming_strategy = naming_strategy

    def get(self, img_path):
        self.set_header('Content-type', 'image/png')
        with open(os.path.join(self.upload_path, img_path), 'rb') as f:
            self.write(f.read())

    def post(self, _name):
        img_arg = 'image'

        if img_arg in self.request.files:
            image = self.request.files[img_arg][0]
            image_name = uuid_naming_strategy(image['filename'])
            image_save_path = os.path.join(self.upload_path, image_name)
            with open(image_save_path, 'wb') as f:
                f.write(image['body'])

            self.write({'img': image_name})
        else:
            self.write({'error': 'no img-arg parameter is found'})


class CheckHandler(tornado.web.RequestHandler):
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
        image_1 = 'image1'
        image_2 = 'image2'

        get_argument = lambda key: tornado.escape.json_decode(self.request.body)[key]

        try:
            image_1_name = get_argument(image_1)
            image_2_name = get_argument(image_2)
            if platform == 'darwin': ratio = random.random()
            else:
                ratio = get_water_print(os.path.join(self.upload_path, image_1_name),
                                        os.path.join(self.upload_path, image_2_name))
            self.write({
                'img1': image_1_name,
                'img2': image_2_name,
                'ratio': ratio
            })
        except Exception as e:
            print(e)
            self.write({'error': 'please check file is been upload to server'})


