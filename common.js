const dayMap = new Map([
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saturday", 6],
  ["Sunday", 7],
]);

const isWithInSessionTime = (sessions) => {
  for (const session of sessions) {
    const { hours: startSessionHour, minutes: startSessionMinute } =
      parseTimeString(session.start);
    const { hours: endSessionHour, minutes: endSessionMinute } =
      parseTimeString(session.end);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    console.debug(`current hour: ${currentHour}`);
    console.debug(
      `start session hour: ${startSessionHour}, start session minute: ${startSessionMinute}`,
    );
    console.debug(
      `end session hour: ${endSessionHour}, end session minute: ${endSessionMinute}`,
    );

    if (currentHour < startSessionHour || currentHour > endSessionHour) {
      console.debug(
        "no need to start this session, since current hour is less of start hour or more of end hour",
      );

      continue;
    }

    if (startSessionHour === endSessionHour) {
      console.debug("start session hour and end session hour are the same");

      const isWithinSessionHours =
        currentHour >= startSessionHour && currentHour <= endSessionHour;
      const isWithinSessionMinutes =
        currentMinute >= startSessionMinute &&
        currentMinute <= endSessionMinute;
      return isWithinSessionHours && isWithinSessionMinutes
        ? true
        : false;
    }

    if (endSessionHour > startSessionHour) {
      console.debug("ent session hour is more than start session hour");

      const isWithinSessionHours =
        currentHour >= startSessionHour && currentHour <= endSessionHour;
      if (!isWithinSessionHours) {
        return true;
      }

      if (isWithinSessionHours && currentHour === endSessionHour) {
        if (endSessionMinute === 0) {
          return false;
        }

        if (currentMinute < endSessionMinute) {
          return true;
        }

        if (currentMinute > endSessionMinute) {
          return false;
        }
      }

      if (isWithinSessionHours && currentHour === startSessionHour) {
        if (startSessionHour === 0) {
          return true
        }

        if (currentMinute < startSessionMinute) {
          return false
        }

        if (currentMinute > startSessionMinute) {
          return true
        }
      }

      return true
    }

    continue;
  }
}

window.isWithInSessionTime = isWithInSessionTime

const parseTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}


window.parseTimeString = parseTimeString