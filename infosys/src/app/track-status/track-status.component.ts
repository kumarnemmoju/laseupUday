import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-track-status',
  templateUrl: './track-status.component.html',
  styleUrls: ['./track-status.component.css'],
})
export class TrackStatusComponent implements OnChanges {
  showStepper = false; // Controls visibility of the stepper
  trackStatus: string = 'unknown';
  steps = [
    { id: 1, title: 'Order Placed', active: false, completed: false },
    { id: 2, title: 'Order Dispatched', active: false, completed: false },
    { id: 3, title: 'Order Delivered', active: false, completed: false },
  ];

  @Input() orderData: any;

  ngOnChanges(changes: SimpleChanges) {
    console.log('Order Data in TrackStatusComponent:', this.orderData); // Debug log
    if (this.orderData && this.orderData.status) {
      this.trackStatus = this.orderData.status.toLowerCase();
      this.showStepper = true; // Show the stepper
      this.updateStepper(this.trackStatus); // Update the stepper
    } else {
      this.trackStatus = 'unknown'; // Default value if orderData is undefined
      this.showStepper = false; // Hide the stepper
    }
  }

  updateStepper(orderStatus: string) {
    // Reset all steps
    this.steps.forEach((step) => {
      step.active = false;
      step.completed = false;
    });

    // Activate and complete steps based on the order status
    switch (orderStatus) {
      case 'order placed':
        this.steps[0].active = true;
        break;
      case 'order dispatched':
        this.steps[0].completed = true;
        this.steps[1].active = true;
        break;
      case 'order delivered':
        this.steps[0].completed = true;
        this.steps[1].completed = true;
        this.steps[2].active = true;
        break;
      default:
        break;
    }
  }
}