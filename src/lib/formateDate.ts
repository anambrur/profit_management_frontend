import { format, parseISO } from 'date-fns';

const FormateDate = (date: string) => {
  const formattedDate = format(parseISO(date), 'dd MMM yyyy');
  const time = format(parseISO(date), 'hh:mm a');
  return { formattedDate, time };
};

export default FormateDate;
