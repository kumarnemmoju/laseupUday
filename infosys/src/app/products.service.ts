import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  baseUrl = "https://67a648e2510789ef0dfaf592.mockapi.io/uday"

  constructor(private http : HttpClient) { }

  getAllProducts(){
    return this.http.get(this.baseUrl + '/shoes');
  }
}
