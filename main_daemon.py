import daemon
from server import main
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)
fh = logging.FileHandler('./ai-lab.log')
logger.addHandler(fh)

with daemon.DaemonContext(files_preserve=[fh.stream],):
    main()

