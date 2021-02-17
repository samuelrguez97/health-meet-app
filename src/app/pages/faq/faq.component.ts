import { Component, OnInit } from '@angular/core';

import { Faq } from './../../shared/models/faq.model';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
})
export class FaqComponent implements OnInit {
  faqs: Array<Faq> = [
    {
      title: '¿Cómo pedir una cita?',
      text:
        'Para reservar una cita haz click/tap sobre la hora inicial durante un segundo o hasta que veas colorearse el recuadro, acto seguido desplaza el ratón y suelta el click/tap en la hora fin de la cita.',
    },
    {
      title: '¿Cómo eliminar una cita?',
      text:
        'Para eliminar una cita haz click/tap sobre la cita en el calendario y accederás al detalle, allí presiona sobre el botón "Eliminar cita" para deshacer el encuentro.',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
