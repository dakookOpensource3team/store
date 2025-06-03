package com.example.ddd_start.member.applicaiton;

import com.example.ddd_start.common.domain.Address;
import com.example.ddd_start.member.applicaiton.model.AddressCommand;
import com.example.ddd_start.member.applicaiton.model.UpdateCommand;
import com.example.ddd_start.member.domain.Member;
import com.example.ddd_start.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateMemberService {

  private final MemberRepository memberRepository;

  public void updateMember(UpdateCommand cmd) throws NotFoundException {
    Member member = memberRepository.findById(cmd.id()).orElseThrow(NotFoundException::new);
    AddressCommand addressCommand = cmd.addressReq();

    member.changeEmail(cmd.email());
    member.changeUsername(cmd.username());
    member.changeName(cmd.name());
    member.changeAddress(new Address(
            addressCommand.getAddress(),
            addressCommand.getDetailedAddress(),
            addressCommand.getZipCode()
        )
    );

    memberRepository.save(member);
  }
}
