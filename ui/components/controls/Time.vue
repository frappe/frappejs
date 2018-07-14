<script>
import BaseDate from './BaseDate';

export default {
  extends: BaseDate,
  props: {
    config: {
      type: Object,
      default: () => ({
        enableTime: true,
        noCalendar: true
      })
    }
  }
};
</script>
<<<<<<< HEAD
<<<<<<< HEAD
=======
<style lang="scss">
@import "flatpickr/dist/flatpickr.css";
</style>
<<<<<<< HEAD
>>>>>>> Time field added
=======
>>>>>>> Simplify template
=======
>>>>>>> Commonify Date and Time component into BaseDate component
