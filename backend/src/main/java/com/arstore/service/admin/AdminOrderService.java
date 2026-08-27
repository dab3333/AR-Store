package com.arstore.service.admin;

import com.arstore.dto.OrderResponse;
import com.arstore.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::from).toList();
    }
}
