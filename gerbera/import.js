// If you are a Kodi user, keeping the ID-prefix may be useful when sorting
// records by "Date added".  Kodi doesn't take account of the time part in the
// M_DATE.  Keeping the ID-prefix makes the sorting works well until the
// ID-prefix wraps around.
const KEEP_ID_PREFIX = false;

// Log levels.
const LOG_LEVEL_OFF = 0;
const LOG_LEVEL_INFO = 1;
const LOG_LEVEL_WARN = 2;
const LOG_LEVEL_ERROR = 3;
const LOG_LEVEL_DEBUG = 4;

// Current log level.
const LOG_LEVEL = LOG_LEVEL_OFF;

if (getPlaylistType(orig.mimetype) === '') {
  // All virtual objects are references to objects in the
  // PC-Directory, so make sure to correctly set the reference ID!
  var obj = orig;
  obj.refID = orig.id;

  var title = obj.title.split('.', 2)[1];
  if (KEEP_ID_PREFIX) {
    title = obj.title;
  }
  if (LOG_LEVEL >= LOG_LEVEL_DEBUG) {
    print('DEBUG: M_TITLE: ' + title);
  }

  const date = computeStartTime(obj);
  if (LOG_LEVEL >= LOG_LEVEL_DEBUG) {
    print('DEBUG: M_DATE: ' + date);
  }

  obj.title = title;
  obj.metaData[M_TITLE] = [title];
  obj.metaData[M_DATE] = [date];

  const dirs = getRootPath(object_script_path, obj.location);
  const recorder = {
    title: dirs[dirs.length - 1].toUpperCase(),
    objectType: OBJECT_TYPE_CONTAINER,
    upnpclass: UPNP_CLASS_CONTAINER,
    metaData: [],
  };
  recorder.metaData[M_CONTENT_CLASS] = [UPNP_CLASS_VIDEO_ITEM];

  var container = addContainerTree([recorder]);
  addCdsObject(obj, container);
  if (LOG_LEVEL >= LOG_LEVEL_INFO) {
    print('INFO: Imported: ' + orig.location);
  }
}

function computeStartTime(obj) {
  const tzOffset = new Date().getTimezoneOffset();
  const duration = parseDuration(obj);  // in seconds
  const startTime = new Date((obj.mtime - duration - (tzOffset * 60)) * 1000);
  return startTime.toISOString().split('.', 2)[0] + formatTz(tzOffset);
}

function parseDuration(obj) {
  const parts = obj.res.duration.split('.')[0].split(':');  // drop milli-seconds
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

function formatTz(tzOffset) {
  var sign = '+';
  if (tzOffset > 0) {
    sign = '-';
  } else {
    tzOffset = -tzOffset;
  }
  const hours = Math.floor(tzOffset / 60);
  const mins = tzOffset % 60;
  return sign + formatDigits(hours) + ':' + formatDigits(mins);
}

function formatDigits(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return '' + n;
  }
}
