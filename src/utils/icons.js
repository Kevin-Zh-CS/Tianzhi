import { ReactComponent as jpgIcon } from '@/icons/jpg.svg';
import { ReactComponent as pngIcon } from '@/icons/png.svg';
import { ReactComponent as jpegIcon } from '@/icons/jpeg.svg';
import { ReactComponent as pdfIcon } from '@/icons/pdf.svg';
import { ReactComponent as wordIcon } from '@/icons/word.svg';
import { ReactComponent as pptIcon } from '@/icons/ppt.svg';
import { ReactComponent as excelIcon } from '@/icons/excel.svg';
import { ReactComponent as txtIcon } from '@/icons/txt.svg';
import { ReactComponent as mdIcon } from '@/icons/md.svg';
import { ReactComponent as mp4Icon } from '@/icons/mp4.svg';
import { ReactComponent as mp3Icon } from '@/icons/mp3.svg';
import { ReactComponent as csvIcon } from '@/icons/csv.svg';
import { ReactComponent as jsonIcon } from '@/icons/json.svg';
import { ReactComponent as xmlIcon } from '@/icons/xml.svg';
import { ReactComponent as rdfIcon } from '@/icons/rdf.svg';
import { ReactComponent as pyIcon } from '@/icons/py.svg';
import { ReactComponent as luaIcon } from '@/icons/lua.svg';
import { ReactComponent as interfaceIcon } from '@/icons/interface.svg';
import { ReactComponent as datasourceIcon } from '@/icons/datasource.svg';
import { ReactComponent as fileIcon } from '@/icons/file.svg';
import { ReactComponent as getIcon } from '@/icons/get.svg';
import { ReactComponent as postIcon } from '@/icons/post.svg';
import { ReactComponent as mongodbIcon } from '@/icons/mongodb.svg';
import { ReactComponent as oracleIcon } from '@/icons/oracle.svg';
import { ReactComponent as mysqlIcon } from '@/icons/mysql.svg';
import { ReactComponent as postgreSQL } from '@/icons/postgreSQL.svg';
import { ReactComponent as gbaseIcon } from '@/icons/g_base.svg';
import { ReactComponent as kingBaseIcon } from '@/icons/king_base.svg';
//
// [get, post],
//   [mongodb, oracle, mysql, gbase, king_base],
import { RES_TYPE } from '@/utils/enums';
import { ReactComponent as videoIcon } from '@/icons/video.svg';

const fileIconMap = [
  fileIcon,
  jpgIcon,
  pngIcon,
  jpegIcon,
  pdfIcon,
  wordIcon,
  pptIcon,
  excelIcon,
  txtIcon,
  mdIcon,
  mp4Icon,
  mp3Icon,
  csvIcon,
  jsonIcon,
  xmlIcon,
  rdfIcon,
  pyIcon,
  luaIcon,
  videoIcon,
  videoIcon,
];

const interfaceIconMap = method => {
  let icon = '';
  switch (method) {
    case 'GET':
      icon = getIcon;
      break;
    case 'POST':
      icon = postIcon;
      break;
    default:
      icon = interfaceIcon;
      break;
  }
  return icon;
};

const dataIconMap = method => {
  let icon = '';
  switch (method) {
    case 'mongo':
      icon = mongodbIcon;
      break;
    case 'oracle':
      icon = oracleIcon;
      break;
    case 'mysql':
      icon = mysqlIcon;
      break;
    case 'postgres':
      icon = postgreSQL;
      break;
    case 'gbase':
      icon = gbaseIcon;
      break;
    case 'kingBase':
      icon = kingBaseIcon;
      break;
    default:
      icon = datasourceIcon;
      break;
  }
  return icon;
};

const getTypeIndex = type => {
  let i = 0;
  switch (type && type.toLowerCase()) {
    case 'jpg':
      i = 1;
      break;
    case 'png':
      i = 2;
      break;
    case 'jpeg':
      i = 3;
      break;
    case 'pdf':
      i = 4;
      break;
    case 'doc':
    case 'docx':
      i = 5;
      break;
    case 'ppt':
    case 'pptx':
      i = 6;
      break;
    case 'xls':
    case 'xlsx':
      i = 7;
      break;
    case 'txt':
      i = 8;
      break;
    case 'md':
      i = 9;
      break;
    case 'mp4':
      i = 10;
      break;
    case 'mp3':
      i = 11;
      break;
    case 'csv':
      i = 12;
      break;
    case 'json':
      i = 13;
      break;
    case 'xml':
      i = 14;
      break;
    case 'rdf':
      i = 15;
      break;
    case 'py':
      i = 16;
      break;
    case 'lua':
      i = 17;
      break;
    default:
      // eslint-disable-next-line no-restricted-globals
      i = isNaN(Number(type)) ? 0 : Number(type);
      break;
  }
  return i;
};

const getFileIcon = (type, method = 0) => {
  let result;
  const i = getTypeIndex(method);
  switch (type) {
    case RES_TYPE.file:
      result = method ? fileIconMap[i] : fileIconMap[0];
      break;
    case RES_TYPE.interface:
      result = method ? interfaceIconMap(method) : interfaceIcon;
      break;
    case RES_TYPE.model:
      result = luaIcon;
      break;
    case RES_TYPE.origin:
      result = method ? dataIconMap(method) : datasourceIcon;
      break;
    default:
      result = 'unknown';
      break;
  }
  return result;
};

export { getFileIcon };
