export default function sanitizeDate(date: string) {
  // sanitize our d/m/yyyy date string to d/mm/yyyy
  const split_d = date.split('/');
  split_d[1] = split_d[1].padStart(2, '0');

  // for future use
  // const formattedDate = new Date(date);
  // const year = formattedDate.getFullYear();
  // const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  // const day = String(formattedDate.getDate()).padStart(2, '0');
  // return `${year}-${month}-${day}`;
  return split_d.join('/');
}
