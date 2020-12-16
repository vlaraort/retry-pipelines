exports.parsePipelineUrl = (urlString) => {
  const url = new URL(urlString);
  const host = `${url.protocol}//${url.hostname}`;
  const path = url.pathname.split("/");
  const pipelineId = path[path.length - 1];
  const projectId = encodeURI(
    `${path[path.length - 4]}/${path[path.length - 3]}`
  );
  return { host, pipelineId, projectId };
};

exports.isValidUrl = (string) => {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
};
