#!usr/bin/python

import ctypes
import numpy as np
from numpy.ctypeslib import ndpointer


IFP=None



def loadIFPLib(libpath):
    global IFP
    IFP = ctypes.CDLL(libpath)
    IFP.GetImageFingerPrint.argtypes = [ctypes.c_void_p,ctypes.c_int,
        np.ctypeslib.ndpointer(dtype=np.int8,ndim=1,flags='C_CONTIGUOUS'),
        ctypes.c_int]
    IFP.GetImageFingerPrint.restype = ctypes.c_int

    IFP.Compare.argtypes = [
        np.ctypeslib.ndpointer(dtype=np.int8,ndim=1,flags='C_CONTIGUOUS'),
        ctypes.c_int,
        np.ctypeslib.ndpointer(dtype=np.int8,ndim=1,flags='C_CONTIGUOUS'),
        ctypes.c_int]
    IFP.Compare.restype = ctypes.c_float

    IFP.GetIFPLength.argtypes=None
    IFP.GetIFPLength.restype = ctypes.c_int

def getIFPLength():
    return IFP.GetIFPLength()
    
def getImageFingerPrint(img):
    if not isinstance(img,bytes):
        raise TypeError('input image must be type of bytes')   
    ifp = np.zeros([getIFPLength()],dtype=np.int8)
    IFP.GetImageFingerPrint(img,len(img),ifp,getIFPLength())
    return ifp

def compare(ifp1,ifp2):
    return IFP.Compare(ifp1,len(ifp1),ifp2,len(ifp2))


def get_water_print(file_path_1, file_path_2):

    imgpath1 = file_path_1
    imgpath2 = file_path_2

    img1 = open(imgpath1, 'rb').read()
    img2 = open(imgpath2, 'rb').read()

    ifp1 = getImageFingerPrint(img1)
    ifp2 = getImageFingerPrint(img2)

    score = compare(ifp1,ifp2)
    return score

libpath = "./libIFP.so"
loadIFPLib(libpath)

if __name__ == '__main__':
	file_1 = './static/images/bird1.jpg'
	file_2 = './static/images/bird1_t.jpg'
	score = get_water_print(file_1, file_2)
	print(score)

