import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getOrderStatus',
  pure: true, // Pure pipes are efficient and only re-evaluate when input changes
})
export class GetOrderStatusPipe implements PipeTransform {
  transform(order: any, allTrackedData: any[]): any {
    if (allTrackedData) {
      return allTrackedData.find((h) => h.orderId == order.orderId) || {};
    }
    return {};
  }
}