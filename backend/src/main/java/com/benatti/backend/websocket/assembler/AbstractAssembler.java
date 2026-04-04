package com.benatti.backend.websocket.assembler;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractAssembler<E, D> {
    abstract D assembleDto(E entity);

    public List<D> assembleList(Collection<E> entity) {
        return entity.stream().map(this::assembleDto).collect(Collectors.toList());
    }
}
