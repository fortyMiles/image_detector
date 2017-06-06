import numpy as np
import tornado
import tornado.ioloop
import tornado.web


def water_print(image1, image2):
    image1_array = np.array(image1)
    return len(image1_array)




if __name__ == '__main__':
    file = open('images/image01.jpg', 'rb').read()
    length = water_print(file, file)

    assert length is not None

    print('test done!')

