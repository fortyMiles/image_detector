import ctypes
import numpy as np

IFP = None


def loadIFPLib(libpath):
    global IFP
    IFP = ctypes.CDLL(libpath)
    IFP.GetImageFingerPrint.argtypes = [ctypes.c_void_p, ctypes.c_int,
                                        np.ctypeslib.ndpointer(dtype=np.int8, ndim=1, flags='C_CONTIGUOUS'),
                                        ctypes.c_int]
    IFP.GetImageFingerPrint.restype = ctypes.c_int

    IFP.Compare.argtypes = [
        np.ctypeslib.ndpointer(dtype=np.int8, ndim=1, flags='C_CONTIGUOUS'),
        ctypes.c_int,
        np.ctypeslib.ndpointer(dtype=np.int8, ndim=1, flags='C_CONTIGUOUS'),
        ctypes.c_int]
    IFP.Compare.restype = ctypes.c_float

    IFP.GetIFPLength.argtypes = None
    IFP.GetIFPLength.restype = ctypes.c_int


def getIFPLength():
    return IFP.GetIFPLength()


def getImageFingerPrint(img):
    if not isinstance(img, bytes):
        raise TypeError('input image must be type of bytes')
    ifp = np.zeros([getIFPLength()], dtype=np.int8)
    IFP.GetImageFingerPrint(img, len(img), ifp, getIFPLength())
    return ifp


def compare(ifp1, ifp2):
    return IFP.Compare(ifp1, len(ifp1), ifp2, len(ifp2))


if __name__ == '__main__':
    libpath = "assets/libIFP.so"
    loadIFPLib(libpath)

    print('ImageFingerPrint bytes:', getIFPLength())

    imgpath1 = "images/image01.jpg"
    imgpath2 = "images/image02.jpg"

    img1 = open(imgpath1, 'rb').read()
    img2 = open(imgpath2, 'rb').read()

    ifp1 = getImageFingerPrint(img1)
    ifp2 = getImageFingerPrint(img2)

    score = compare(ifp1, ifp2)
    print(score)


